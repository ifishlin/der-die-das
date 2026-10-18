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
let player = null;
function say(url, fallbackText) {
  if (player) player.pause();
  player = new Audio(url);
  return player.play().catch(() => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(fallbackText); u.lang = 'de-DE'; u.rate = .8;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }
  });
}
const sayLetter = L => say(`audio/abc/${L.key}.mp3`, L.up);
const sayWord = c => say(`audio/${c.id}.mp3`, `${c.art} ${c.noun}`);

// ---------- table ----------
function wordBtn(c) {
  const b = document.createElement('button');
  b.className = 'w ' + c.art;
  b.setAttribute('aria-label', `${c.art} ${c.noun}，${c.zh}`);
  b.innerHTML = `<img src="img/${c.id}.jpg" alt="" loading="lazy"><span class="t"><i>${c.art}</i>${c.noun}</span>`;
  b.addEventListener('click', () => { sayWord(c); });
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
    cell.innerHTML = `<div class="cellhead"><button class="letter" aria-label="聽字母 ${L.up}">${L.up}${L.low}</button><button class="swap">換一組</button></div><div class="words"></div><div class="few"></div>`;
    cell.querySelector('.letter').addEventListener('click', () => sayLetter(L));
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

// ---------- practice ----------
let cur = null, bag = [], tried = false, right = 0, total = 0;
function nextLetter() {
  if (!bag.length) bag = shuffle(LETTERS.slice());
  let n = bag.pop();
  if (cur && n === cur && bag.length) { bag.unshift(n); n = bag.pop(); }
  cur = n; tried = false;
  $('bigLetter').textContent = n.up + n.low;
  $('hint').hidden = true;
  $('result').hidden = true;
  $('status').textContent = '按麥克風，念出字母的名字';
  $('ask').textContent = '請念出這個字母';
}
function showHint() {
  $('hintWords').replaceChildren(...shown[cur.up].map(wordBtn));
  $('hint').hidden = false;
}
const norm = s => s.toLowerCase().normalize('NFC').replace(/[^a-zäöüß ]/g, '').trim();
// accept the letter's name, or a word that begins with this letter (children often say "Ball" for B)
function judge(alts) {
  for (const raw of alts) {
    const t = norm(raw); if (!t) continue;
    const parts = t.split(/\s+/);
    if (parts.some(p => cur.aliases.includes(p)) || cur.aliases.includes(t.replace(/ /g, ''))) return {ok: true, via: 'name', heard: raw};
  }
  for (const raw of alts) {
    const t = norm(raw); if (!t) continue;
    const w = t.split(/\s+/).find(p => p.length > 1 && p[0] === cur.low);
    if (w && !/^(der|die|das)$/.test(w) && !special(w)) return {ok: true, via: 'word', heard: raw, word: w};
  }
  return {ok: false, heard: alts[0]};
}
function showResult(r) {
  const box = $('result'); box.hidden = false;
  box.className = 'result ' + (r.ok ? 'good' : 'bad');
  box.innerHTML = r.ok
    ? `<b>對了！</b><span>${r.via === 'word' ? `你說的「${r.word}」是 ${cur.up} 開頭的字。` : `這個字母念「${cur.up}」。`}</span>`
    : `<b>再試一次</b><span>我聽到：「${r.heard}」。這個字母要念 ${cur.up}，按「聽示範」聽聽看。</span>`;
  if (!tried) { total++; if (r.ok) right++; tried = true; }
  $('right').textContent = right; $('total').textContent = total;
  if (!r.ok) { setTimeout(() => sayLetter(cur), 700); showHint(); }
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
    if (alts.length) showResult(judge(alts));
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
$('listen').addEventListener('click', () => cur && sayLetter(cur));
$('bigLetter').addEventListener('click', () => cur && sayLetter(cur));
$('showHint').addEventListener('click', showHint);
$('next').addEventListener('click', nextLetter);

buildGrid();
if (location.hash === '#practice') setMode(true);
