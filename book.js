// Reader for one picture-book study guide: book.html?b=<id> loads books/<id>/data.js (const BOOK).
const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));
const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const id = new URLSearchParams(location.search).get('b') || (BOOKS[0] && BOOKS[0].id);
const base = `books/${encodeURIComponent(id)}/`;

let player = null, runId = 0;
function play(file, de) {
  if (player) player.pause();
  return new Promise(res => {
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

let rows = [];
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
      const b = btn('聽這句'); b.addEventListener('click', () => { runId++; play(l.audio, l.de); });
      row.append(b);
      row.insertAdjacentHTML('beforeend', `<div><div class="de">${esc(l.de)}</div><div class="zhline">${esc(l.zh)}</div>${gramHtml(l.gram)}</div>`);
      return row;
    };
    sec.insertAdjacentHTML('beforeend', '<div class="sec main">故事主線</div>');
    s.main.forEach(l => { const r = line(l, 'main'); sec.append(r); rows.push({el: r, audio: l.audio, de: l.de}); });
    const side = document.createElement('div'); side.className = 'sidebox';
    side.insertAdjacentHTML('beforeend', '<div class="sec">旁枝（畫面上的小細節）</div>');
    s.side.forEach(l => side.append(line(l, 'side')));
    sec.append(side);
    sec.insertAdjacentHTML('beforeend', '<div class="sec">難字（點喇叭單獨聽）</div>');
    const v = document.createElement('div'); v.className = 'vocab';
    s.words.forEach(w => {
      const el = document.createElement('div'); el.className = 'word';
      const b = btn('聽 ' + w.de); b.addEventListener('click', () => { runId++; el.classList.add('on'); play(w.audio, w.de).then(() => el.classList.remove('on')); });
      el.append(b);
      el.insertAdjacentHTML('beforeend', `<div><div class="wde">${artHtml(esc(w.de))}</div><div class="ipa">/${w.ipa}/</div><div class="wzh">${esc(w.zh)}</div>${w.note ? `<div class="nt">${esc(w.note)}</div>` : ''}</div>`);
      v.append(el);
    });
    sec.append(v);
    $('spreads').append(sec);
  });
}
async function playAll() {
  const me = ++runId; $('playAll').hidden = true; $('stop').hidden = false;
  for (const r of rows) {
    if (me !== runId) break;
    r.el.classList.add('on'); r.el.scrollIntoView({block: 'center', behavior: 'smooth'});
    await play(r.audio, r.de); r.el.classList.remove('on'); await wait(700);
  }
  rows.forEach(r => r.el.classList.remove('on')); $('playAll').hidden = false; $('stop').hidden = true;
}
function toggle(btnId, cls, invert) {
  $(btnId).addEventListener('click', () => {
    const on = $(btnId).getAttribute('aria-pressed') !== 'true';
    $(btnId).setAttribute('aria-pressed', String(on)); document.body.classList.toggle(cls, !on);
  });
}
$('playAll').addEventListener('click', playAll);
$('stop').addEventListener('click', () => { runId++; if (player) player.pause(); rows.forEach(r => r.el.classList.remove('on')); $('playAll').hidden = false; $('stop').hidden = true; });
toggle('zhToggle', 'nozh'); toggle('gramToggle', 'nogram'); toggle('sideToggle', 'noside');

const s = document.createElement('script'); s.src = base + 'data.js?v=20261021e';
s.onload = render; s.onerror = () => { $('title').textContent = '找不到這本書'; };
document.head.append(s);
