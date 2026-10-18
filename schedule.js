// Renders the lesson plan from schedule-data.js: lessons in order, each with a simple-German explanation, audio, and key words.
const $ = id => document.getElementById(id);
const day = SCHEDULE[0];
const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const esc = s => s.replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));

let player = null, runId = 0;
function play(url, de) {
  if (player) player.pause();
  return new Promise(res => {
    const a = player = new Audio(url);
    a.onended = () => res();
    a.play().catch(() => {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(de); u.lang = 'de-DE'; u.rate = .85; u.onend = () => res();
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      } else res();
    });
  });
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const btn = label => { const b = document.createElement('button'); b.className = 'play'; b.setAttribute('aria-label', label); b.innerHTML = PLAY; return b; };
const artHtml = de => de.replace(/^(der|die|das) /, (m, a) => `<span class="art-${a}">${a}</span> `);

const rows = []; // [{el, audio, de, lesson}] in reading order, for "play all"
$('day').textContent = `${day.label} · ${day.zh}`;
day.items.forEach((it, i) => {
  const sec = document.createElement('section');
  sec.className = 'lesson ' + it.color;
  sec.innerHTML = `<div class="lh"><div class="num">${i + 1}</div><div><h2>${esc(it.title)}</h2><div class="zh">${esc(it.zh)}</div></div></div>`;
  const orig = document.createElement('div'); orig.className = 'orig';
  const ob = btn('聽老師寫的德文');
  orig.append(ob);
  orig.insertAdjacentHTML('beforeend', `<div class="tx"><div class="lab">老師寫的</div><div class="de">${esc(it.original)}</div><div class="zhline">${esc(it.originalZh)}</div></div>`);
  ob.addEventListener('click', () => { runId++; play(it.originalAudio, it.original); });
  sec.append(orig);
  rows.push({el: orig, audio: it.originalAudio, de: it.original});

  sec.insertAdjacentHTML('beforeend', '<div class="sec">這一段要做什麼</div>');
  it.lines.forEach(l => {
    const row = document.createElement('div'); row.className = 'line';
    const b = btn('聽這句');
    b.addEventListener('click', () => { runId++; play(l.audio, l.de); });
    row.append(b);
    row.insertAdjacentHTML('beforeend', `<div><div class="de">${esc(l.de)}</div><div class="zhline">${esc(l.zh)}</div></div>`);
    sec.append(row);
    rows.push({el: row, audio: l.audio, de: l.de});
  });

  sec.insertAdjacentHTML('beforeend', '<div class="sec">難字（點喇叭單獨聽）</div>');
  const v = document.createElement('div'); v.className = 'vocab';
  it.words.forEach(w => {
    const el = document.createElement('div'); el.className = 'word';
    const b = btn('聽 ' + w.de);
    b.addEventListener('click', () => { runId++; el.classList.add('on'); play(w.audio, w.de).then(() => el.classList.remove('on')); });
    el.append(b);
    el.insertAdjacentHTML('beforeend', `<div><div class="wde">${artHtml(esc(w.de))}</div><div class="ipa">/${w.ipa}/${w.composed ? ' <span class="nt">（合成）</span>' : ''}</div><div class="wzh">${esc(w.zh)}</div>${w.note ? `<div class="nt">${esc(w.note)}</div>` : ''}</div>`);
    v.append(el);
  });
  sec.append(v);
  $('lessons').append(sec);
});

async function playAll() {
  const id = ++runId;
  $('playAll').hidden = true; $('stop').hidden = false;
  for (const r of rows) {
    if (id !== runId) break;
    r.el.classList.add('on'); r.el.scrollIntoView({block: 'center', behavior: 'smooth'});
    await play(r.audio, r.de);
    r.el.classList.remove('on');
    await wait(600);
  }
  rows.forEach(r => r.el.classList.remove('on'));
  $('playAll').hidden = false; $('stop').hidden = true;
}
$('playAll').addEventListener('click', playAll);
$('stop').addEventListener('click', () => { runId++; if (player) player.pause(); rows.forEach(r => r.el.classList.remove('on')); $('playAll').hidden = false; $('stop').hidden = true; });
$('zhToggle').addEventListener('click', () => {
  const on = $('zhToggle').getAttribute('aria-pressed') !== 'true';
  $('zhToggle').setAttribute('aria-pressed', String(on));
  document.body.classList.toggle('nozh', !on);
});
