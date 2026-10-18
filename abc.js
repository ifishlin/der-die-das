// Alphabet table + practice for abc.html. Words come from CARDS (cards.js), grouped by initial letter.
const $ = id => document.getElementById(id);

const LETTERS = [
  ['A', 'a', ['a', 'ah', 'aa']], ['B', 'b', ['be', 'beh', 'bee', 'b', 'bé']], ['C', 'c', ['tse', 'ze', 'tze', 'zeh', 'tsee', 'c', 'cé', 'tsé']],
  ['D', 'd', ['de', 'deh', 'dee', 'd', 'dé']], ['E', 'e', ['e', 'eh', 'ee']], ['F', 'f', ['eff', 'ef', 'f', 'äff', 'eph']],
  ['G', 'g', ['ge', 'geh', 'gee', 'g', 'gé']], ['H', 'h', ['ha', 'hah', 'haa', 'h']], ['I', 'i', ['i', 'ie', 'ih', 'ee']],
  ['J', 'j', ['jott', 'jot', 'yot', 'yott', 'j', 'jod']], ['K', 'k', ['ka', 'kah', 'kaa', 'k']], ['L', 'l', ['ell', 'el', 'l', 'äl', 'ehl']],
  ['M', 'm', ['emm', 'em', 'm', 'äm', 'ehm']], ['N', 'n', ['enn', 'en', 'n', 'än', 'ehn']], ['O', 'o', ['o', 'oh', 'oo']],
  ['P', 'p', ['pe', 'peh', 'pee', 'p', 'pé']], ['Q', 'q', ['ku', 'kuh', 'koo', 'q', 'qu']], ['R', 'r', ['err', 'er', 'r', 'är', 'ehr']],
  ['S', 's', ['ess', 'es', 's', 'äs']], ['T', 't', ['te', 'teh', 'tee', 't', 'té']], ['U', 'u', ['u', 'uh', 'oo']],
  ['V', 'v', ['fau', 'vau', 'fao', 'v', 'fow', 'faou']], ['W', 'w', ['we', 'weh', 'vee', 'w', 'wé', 've']], ['X', 'x', ['iks', 'ix', 'x', 'ics', 'icks']],
  ['Y', 'y', ['üpsilon', 'ypsilon', 'ypsilone', 'y', 'üpsilone', 'upsilon']], ['Z', 'z', ['zett', 'zet', 'z', 'tsett', 'set']],
  ['Ä', 'ae', ['ä', 'ae', 'äh', 'e', 'eh']], ['Ö', 'oe', ['ö', 'oe', 'öh', 'ø']], ['Ü', 'ue', ['ü', 'ue', 'üh', 'y']],
].map(([up, key, aliases]) => ({up, low: up.toLowerCase(), key, aliases}));

// ---------- pool ----------
const startsWith = (c, up) => c.noun[0].toUpperCase() === up;
const special = n => /^(Sch|St|Sp|Ch)/i.test(n);
function pool(L) {
  return CARDS.filter(c => startsWith(c, L.up) && !(L.up === 'S' || L.up === 'C' ? special(c.noun) : false));
}
const POOLS = Object.fromEntries(LETTERS.map(L => [L.up, pool(L)]));
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// pick up to 3; prefer words not currently shown so a re-roll really changes something
function pick(L, current = []) {
  const p = POOLS[L.up];
  if (p.length <= 3) return shuffle(p.slice());
  const fresh = shuffle(p.filter(c => !current.includes(c.id)));
  const rest = shuffle(p.filter(c => current.includes(c.id)));
  return fresh.concat(rest).slice(0, 3);
}
const shown = {};
LETTERS.forEach(L => shown[L.up] = pick(L));

// ---------- audio ----------
let player = null, seqId = 0;
function say(url, fallbackText) {
  if (player) player.pause();
  return new Promise(res => {
    const a = player = new Audio(url);
    a.onended = () => res();
    a.play().catch(() => {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(fallbackText); u.lang = 'de-DE'; u.rate = .8; u.onend = () => res();
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      } else res();
    });
  });
}
const sayLetter = L => say(`audio/abc/${L.key}.mp3`, L.up);
const sayWord = c => say(`audio/${c.id}.mp3`, `${c.art} ${c.noun}`);
const wait = ms => new Promise(r => setTimeout(r, ms));
// letter first, then its words one by one; mark(i) highlights item i (0 = letter, 1..n = words)
async function sayAll(L, mark) {
  const id = ++seqId, words = shown[L.up];
  for (let i = 0; i <= words.length; i++) {
    if (id !== seqId) return;
    mark(i);
    await (i === 0 ? sayLetter(L) : sayWord(words[i - 1]));
    await wait(450);
  }
  if (id === seqId) mark(-1);
}

// ---------- table ----------
function wordBtn(c) {
  const b = document.createElement('button');
  b.className = 'w ' + c.art;
  b.setAttribute('aria-label', `${c.art} ${c.noun}，${c.zh}`);
  b.innerHTML = `<img src="img/${c.id}.jpg" alt="" loading="lazy"><span class="t"><i>${c.art}</i>${c.noun}</span>`;
  b.addEventListener('click', () => { seqId++; sayWord(c); });
  return b;
}
function renderCell(L) {
  const cell = $('cell-' + L.key);
  const words = cell.querySelector('.words');
  words.replaceChildren(...shown[L.up].map(wordBtn));
  cell.querySelector('.swap').disabled = POOLS[L.up].length <= 3;
  const f = cell.querySelector('.few');
  f.textContent = POOLS[L.up].length < 3 ? `目前只有 ${POOLS[L.up].length} 個字` : '';
}
function buildGrid() {
  const g = $('grid');
  LETTERS.forEach(L => {
    const cell = document.createElement('div');
    cell.className = 'cell'; cell.id = 'cell-' + L.key;
    cell.innerHTML = `<div class="cellhead"><button class="letter" aria-label="聽字母 ${L.up} 和單字">${L.up}${L.low}</button><button class="swap">換一組</button></div><div class="words"></div><div class="few"></div>`;
    cell.querySelector('.letter').addEventListener('click', () => sayAll(L, i => {
      cell.classList.toggle('sel', i >= 0);
      cell.querySelector('.letter').classList.toggle('on', i === 0);
      cell.querySelectorAll('.w').forEach((w, k) => w.classList.toggle('on', k === i - 1));
    }));
    cell.querySelector('.swap').addEventListener('click', () => { shown[L.up] = pick(L, shown[L.up].map(c => c.id)); renderCell(L); });
    g.appendChild(cell);
    renderCell(L);
  });
  const few = LETTERS.filter(L => POOLS[L.up].length < 3);
  $('fewNote').textContent = few.length
    ? `${few.map(L => L.up).join('、')} 開頭的常見德文字本來就比較少，所以這幾個字母不到三個字。` : '';
}
$('regen').addEventListener('click', () => {
  LETTERS.forEach(L => { shown[L.up] = pick(L, shown[L.up].map(c => c.id)); renderCell(L); });
  if (!$('prac').hidden) nextLetter();
});

// ---------- mode ----------
function setMode(prac) {
  $('table').hidden = prac; $('prac').hidden = !prac;
  $('m-table').setAttribute('aria-pressed', String(!prac));
  $('m-prac').setAttribute('aria-pressed', String(prac));
  $('regen').hidden = prac;
  if (prac && !cur) nextLetter();
  try { history.replaceState(null, '', prac ? '#practice' : location.pathname); } catch (e) {}
}
$('m-table').addEventListener('click', () => setMode(false));
$('m-prac').addEventListener('click', () => setMode(true));

// ---------- practice: say the letter first, then each of its three words ----------
let cur = null, bag = [], step = 0, right = 0, total = 0, tries = 0;
const target = () => step === 0 ? null : shown[cur.up][step - 1];
function markStep() {
  $('bigLetter').classList.toggle('on', step === 0);
  [...$('hintWords').children].forEach((w, k) => w.classList.toggle('on', k === step - 1));
  const t = target();
  if (step > shown[cur.up].length) return;
  $('ask').textContent = step === 0 ? '先念這個字母' : `再念這個字：${t.art} ${t.noun}`;
  $('status').textContent = '按麥克風開始念';
}
function nextLetter() {
  seqId++;
  if (!bag.length) bag = shuffle(LETTERS.slice());
  let n = bag.pop();
  if (cur && n === cur && bag.length) { bag.unshift(n); n = bag.pop(); }
  cur = n; step = 0; tries = 0;
  $('bigLetter').textContent = n.up + n.low;
  $('hintWords').replaceChildren(...shown[n.up].map(wordBtn));
  $('result').hidden = true;
  markStep();
}
const norm = s => s.toLowerCase().normalize('NFC').replace(/[^a-zäöüß ]/g, '').trim();
function judgeLetter(alts) {
  for (const raw of alts) {
    const t = norm(raw); if (!t) continue;
    if (t.split(/\s+/).some(p => cur.aliases.includes(p)) || cur.aliases.includes(t.replace(/ /g, ''))) return {ok: true, heard: raw};
  }
  return {ok: false, heard: alts[0]};
}
function judgeWord(alts) {
  const r = SpeechMatch.best(alts, target());
  return {ok: r.nounOk, heard: r.transcript || alts[0], articleOk: r.articleOk};
}
async function showResult(r) {
  const box = $('result'); box.hidden = false;
  box.className = 'result ' + (r.ok ? 'good' : 'bad');
  const t = target(), name = step === 0 ? cur.up : `${t.art} ${t.noun}`;
  if (r.ok) {
    const last = step === shown[cur.up].length;
    box.innerHTML = `<b>對了！</b><span>${name}</span>`;
    if (tries === 0) right++; total++; tries = 0;
    $('right').textContent = right; $('total').textContent = total;
    if (last) { box.innerHTML = `<b>這個字母完成了！</b><span>${cur.up} 的字母和三個字都念完了。按「下一個字母」。</span>`; step = 4; markStep(); $('ask').textContent = '完成！'; $('status').textContent = ''; return; }
    step++; await wait(900); markStep(); box.hidden = true;
  } else {
    tries++;
    box.innerHTML = `<b>再試一次</b><span>我聽到：「${r.heard}」。正確是 ${name}，先聽示範再念。</span>`;
    await wait(500); (step === 0 ? sayLetter(cur) : sayWord(t));
  }
}

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, listening = false;
if (!SR) { $('unsupported').hidden = false; $('mic').disabled = true; $('status').textContent = '這個瀏覽器不能用語音辨識'; }
function startListening() {
  if (!SR || listening) return;
  if (player) player.pause();
  rec = new SR();
  rec.lang = 'de-DE'; rec.interimResults = false; rec.maxAlternatives = 8; rec.continuous = false;
  let got = false;
  rec.onresult = e => {
    got = true;
    const alts = [...e.results[0]].map(a => a.transcript).filter(Boolean);
    if (alts.length && step <= shown[cur.up].length) showResult(step === 0 ? judgeLetter(alts) : judgeWord(alts));
  };
  rec.onerror = e => {
    got = true;
    $('status').textContent = {
      'not-allowed': '沒有麥克風權限。請到設定允許 Safari 使用麥克風，再重新整理頁面。',
      'service-not-allowed': '沒有語音辨識權限。請到「設定 → Safari」允許語音辨識。',
      'no-speech': '沒有聽到聲音，靠近一點再說一次。',
      'network': '語音辨識需要網路，請檢查連線。',
      'audio-capture': '找不到麥克風。',
    }[e.error] || `語音辨識出了問題（${e.error}），再試一次。`;
  };
  rec.onend = () => {
    listening = false; $('mic').classList.remove('listening');
    if (!got) $('status').textContent = '沒有聽清楚，再按一次麥克風試試。';
    else if ($('status').textContent === '在聽…') $('status').textContent = '按麥克風可以再說一次';
  };
  try { rec.start(); listening = true; $('mic').classList.add('listening'); $('status').textContent = '在聽…'; }
  catch (err) { $('status').textContent = '麥克風啟動失敗，再按一次試試。'; }
}
$('mic').addEventListener('click', () => listening ? rec.stop() : startListening());
$('listen').addEventListener('click', () => cur && sayAll(cur, i => { $('bigLetter').classList.toggle('on', i === 0); [...$('hintWords').children].forEach((w, k) => w.classList.toggle('on', k === i - 1)); if (i < 0) markStep(); }));
$('bigLetter').addEventListener('click', () => cur && (seqId++, sayLetter(cur)));
$('skip').addEventListener('click', () => { if (step <= shown[cur.up].length) { if (step === 0) sayLetter(cur); else sayWord(target()); } });
$('next').addEventListener('click', nextLetter);

buildGrid();
if (location.hash === '#practice') setMode(true);
