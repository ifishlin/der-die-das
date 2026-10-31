// Reader for one picture-book study guide: book.html?b=<id> loads books/<id>/data.js (const BOOK).
const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));
const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const id = new URLSearchParams(location.search).get('b') || (BOOKS[0] && BOOKS[0].id);
const base = `books/${encodeURIComponent(id)}/`;

let player = null, runId = 0, finish = null;
function play(file, de) {
  if (player) player.pause();
  if (finish) finish(); // let whoever awaited the interrupted line move on
  return new Promise(res => {
    finish = res;
    const a = player = new Audio(base + file);
    a.onended = () => res();
    a.play().catch(() => {
      if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(de); u.lang = 'de-DE'; u.rate = .85; u.onend = () => res(); speechSynthesis.cancel(); speechSynthesis.speak(u); } else res();
    });
  });
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const btn = label => { const b = document.createElement('button'); b.className = 'play'; b.setAttribute('aria-label', label); b.innerHTML = PLAY; return b; };
const gramHtml = g => g && g.length ? `<ul class="gram">${g.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
const artHtml = de => de.replace(/^(der|die|das) /, (m, a) => `<span class="art-${a}">${a}</span> `);

let rows = [], origRows = [];
function render() {
  document.title = `${BOOK.title} · 繪本 · Der Die Das 小卡`;
  $('title').textContent = BOOK.title;
  $('sub').textContent = `${BOOK.author} · ${BOOK.zh}。${BOOK.blurb}`;
  BOOK.spreads.forEach(s => {
    const a = document.createElement('a'); a.href = '#sp' + s.n; a.setAttribute('aria-label', `第 ${s.n} 頁：${s.zh}`);
    a.innerHTML = `<img src="${base + s.icon}" alt="" width="72" height="54"><span>${s.n}</span>`;
    $('strip').append(a);
    const sec = document.createElement('section'); sec.className = 'sp'; sec.id = 'sp' + s.n;
    sec.innerHTML = `<a class="shot" href="${base + s.icon}" target="_blank" rel="noopener" aria-label="第 ${s.n} 頁的照片，點一下看原尺寸"><img src="${base + s.icon}" alt="第 ${s.n} 頁的照片" width="2048" height="1536"></a><div class="sh"><div><div class="no">第 ${s.n} 頁（跨頁）</div><h2>${esc(s.zh)}</h2></div></div>`;
    const line = (l, cls) => {
      const row = document.createElement('div'); row.className = 'line ' + cls;
      const b = btn('聽這句'); b.addEventListener('click', () => { halt(true); play(l.audio, l.de); });
      row.append(b);
      row.insertAdjacentHTML('beforeend', `<div><div class="de">${esc(l.de)}</div><div class="zhline">${esc(l.zh)}</div>${gramHtml(l.gram)}</div>`);
      return row;
    };
    if (s.orig) {
      sec.insertAdjacentHTML('beforeend', '<div class="sec main">書上原文</div>');
      s.orig.forEach(l => {
        const row = document.createElement('div'); row.className = 'line orig';
        const b = btn('聽這句'); b.addEventListener('click', () => { halt(true); play(l.audio, l.de); });
        row.append(b);
        row.insertAdjacentHTML('beforeend', `<div><div class="de">${esc(l.de)}</div></div>`);
        sec.append(row); origRows.push({el: row, sec, n: s.n, audio: l.audio, de: l.de});
      });
    }
    sec.insertAdjacentHTML('beforeend', '<div class="sec main">故事主線</div>');
    s.main.forEach(l => { const r = line(l, 'main'); sec.append(r); rows.push({el: r, sec, n: s.n, audio: l.audio, de: l.de}); });
    const side = document.createElement('div'); side.className = 'sidebox';
    side.insertAdjacentHTML('beforeend', '<div class="sec">旁枝（畫面上的小細節）</div>');
    s.side.forEach(l => side.append(line(l, 'side')));
    sec.append(side);
    sec.insertAdjacentHTML('beforeend', '<div class="sec">難字（點喇叭單獨聽）</div>');
    const v = document.createElement('div'); v.className = 'vocab';
    s.words.forEach(w => {
      const el = document.createElement('div'); el.className = 'word';
      const b = btn('聽 ' + w.de); b.addEventListener('click', () => { halt(true); el.classList.add('on'); play(w.audio, w.de).then(() => el.classList.remove('on')); });
      el.append(b);
      el.insertAdjacentHTML('beforeend', `<div><div class="wde">${artHtml(esc(w.de))}</div><div class="ipa">/${w.ipa}/</div><div class="wzh">${esc(w.zh)}</div>${w.note ? `<div class="nt">${esc(w.note)}</div>` : ''}</div>`);
      v.append(el);
    });
    sec.append(v);
    $('spreads').append(sec);
  });
}
// ---------- read-through: play / pause / resume, position remembered per book across reloads ----------
const KEY = 'book-pos:' + id, NAME = {orig: '原文', main: '主線'};
const saved = {
  get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } },
  set(v) { try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY); } catch (e) {} },
};
const lists = () => ({orig: origRows, main: rows});
let paused = false, live = false;
function setUI(state) { // 'idle' | 'playing' | 'paused'
  document.body.classList.toggle('reading', state !== 'idle');
  $('playOrig').hidden = state !== 'idle' || !origRows.length;
  $('playAll').hidden = state !== 'idle';
  $('pause').hidden = state !== 'playing';
  $('stop').hidden = state === 'idle';
  const pos = saved.get(), r = pos && (lists()[pos.kind] || [])[pos.i];
  $('resume').hidden = !(state === 'paused' || (state === 'idle' && r));
  $('resume').textContent = state === 'paused' ? '繼續念' : r ? `從第 ${r.n} 頁繼續念${NAME[pos.kind]}` : '繼續念';
}
// end a read-through; keep=true leaves the position so it can be resumed later
function halt(keep) {
  runId++; paused = false; live = false;
  if (player) player.pause();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (finish) finish();
  if (!keep) saved.set(null);
  rows.concat(origRows).forEach(r => r.el.classList.remove('on'));
  setUI('idle');
}
async function playAll(kind, start = 0) {
  halt(true);
  const me = runId, list = lists()[kind];
  live = true; setUI('playing');
  let page = null;
  for (let i = start; i < list.length; i++) {
    if (me !== runId) return; // halted: halt() already reset the buttons
    const r = list[i]; saved.set({kind, i});
    // scroll once per spread, to its photo, and stay there while its lines are read
    if (r.sec !== page) { page = r.sec; page.scrollIntoView({block: 'start', behavior: 'smooth'}); }
    r.el.classList.add('on');
    await play(r.audio, r.de); // a pause mid-line holds this until the audio is resumed and ends
    await wait(700);
    while (paused && me === runId) await wait(200); // paused between lines
    r.el.classList.remove('on');
  }
  if (me !== runId) return;
  live = false; saved.set(null); setUI('idle');
}
function pauseAll() {
  paused = true;
  if (player) player.pause();
  if ('speechSynthesis' in window && speechSynthesis.speaking) speechSynthesis.pause();
  setUI('paused');
}
function resumeAll() {
  if (live && paused) {
    paused = false;
    if (player && player.paused && !player.ended) player.play().catch(() => {});
    if ('speechSynthesis' in window) speechSynthesis.resume();
    setUI('playing');
  } else {
    const pos = saved.get();
    if (pos && lists()[pos.kind]) playAll(pos.kind, pos.i);
  }
}
function toggle(btnId, cls, invert) {
  $(btnId).addEventListener('click', () => {
    const on = $(btnId).getAttribute('aria-pressed') !== 'true';
    $(btnId).setAttribute('aria-pressed', String(on)); document.body.classList.toggle(cls, !on);
  });
}
$('playAll').addEventListener('click', () => playAll('main'));
$('playOrig').addEventListener('click', () => playAll('orig'));
$('pause').addEventListener('click', pauseAll);
$('resume').addEventListener('click', resumeAll);
$('stop').addEventListener('click', () => halt(false));
toggle('zhToggle', 'nozh'); toggle('gramToggle', 'nogram'); toggle('sideToggle', 'noside');

const s = document.createElement('script'); s.src = base + 'data.js?v=20261031';
s.onload = () => { render(); setUI('idle'); }; s.onerror = () => { $('title').textContent = '找不到這本書'; };
document.head.append(s);
