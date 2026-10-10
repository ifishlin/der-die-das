// Pronunciation (IPA) display shared by the card, speaking and game pages.
// Each card's `ipa` comes from German Wiktionary (de.wiktionary.org). Compounds that have no
// entry there carry `ipaComposed: 1`: they were joined from their parts and are marked with *.
const IPA = (() => {
  const css = `
.ipa{font-family:"Charis SIL","Gentium Plus","Noto Sans","Lucida Sans Unicode","DejaVu Sans","Arial Unicode MS",system-ui,sans-serif;color:var(--muted,#5B6675);font-size:.95em;letter-spacing:.01em;font-weight:400}
.card .ipa{display:block;font-size:.92rem;line-height:1.3}
.answer .ipa{display:block;font-size:.55em;margin-top:2px}
.ipa-legend{background:var(--paper,#fff);border:1px solid var(--line,#D5DBE2);border-radius:14px;padding:10px 14px;color:var(--ink,#1C2430);font-size:.92rem}
.ipa-legend summary{cursor:pointer;font-weight:700}
.ipa-legend h4{margin:12px 0 2px;font-size:.8rem;color:var(--muted,#5B6675);font-weight:700}
.ipa-legend .row{display:grid;grid-template-columns:6.5em 1fr;gap:2px 10px;padding:7px 0;border-top:1px solid var(--line,#D5DBE2)}
.ipa-legend .ex{display:block;color:var(--muted,#5B6675);font-size:.88rem}
.ipa-legend .sym{font-family:"Charis SIL","Gentium Plus","Noto Sans","Lucida Sans Unicode","DejaVu Sans",system-ui,sans-serif;font-size:1.05rem;font-weight:700}
.ipa-legend .src{color:var(--muted,#5B6675);font-size:.85rem;margin:8px 0 0}
`;
  document.head.appendChild(Object.assign(document.createElement('style'), {textContent: css}));

  const esc = s => String(s).replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));

  /** "[ˈkaktʊs]" (with a * when the entry was joined from its parts). */
  function text(card) {
    return card.ipa ? `[${card.ipa}]${card.ipaComposed ? '*' : ''}` : '';
  }
  function html(card) {
    return card.ipa ? `<span class="ipa" lang="de-fonipa">${esc(text(card))}</span>` : '';
  }

  // symbol, roughly like (Mandarin), example word
  const ROWS = [
    ['記號', [
      ['ˈ', '重音在它後面那一段', 'Kaktus [ˈkaktʊs]'],
      ['ˌ', '次重音（第二強的一段）', 'Bleistift [ˈblaɪ̯ˌʃtɪft]'],
      ['ː', '把前面的母音拉長', 'Buch [buːx]'],
    ]],
    ['母音', [
      ['aː　a', '長「啊」／短「啊」', 'Wal [vaːl]　Ball [bal]'],
      ['eː　ɛ', '嘴扁的「誒」／嘴開的「欸」', 'Reh [ʁeː]　Heft [hɛft]'],
      ['iː　ɪ', '長「衣」／短而鬆的「衣」', 'Biene [ˈbiːnə]　Fisch [fɪʃ]'],
      ['oː　ɔ', '長「喔」／短而開的「喔」', 'Brot [bʁoːt]　Block [blɔk]'],
      ['uː　ʊ', '長「烏」／短而鬆的「烏」', 'Kuh [kuː]　Hund [hʊnt]'],
      ['yː　ʏ', '嘴巴噘成「嗚」，卻發「衣」的音', 'Küken [ˈkyːkn̩]　Mütze [ˈmʏtsə]'],
      ['øː　œ', '嘴巴噘成「喔」，卻發「誒」的音', 'Löwe [ˈløːvə]　Löffel [ˈlœfl̩]'],
      ['ə', '很輕很短的「呃」', 'Kerze [ˈkɛʁtsə]'],
      ['ɐ', '字尾 -er 的輕音，像短促的「啊」', 'Feder [ˈfeːdɐ]'],
      ['ɐ̯', '很輕的 r 尾音，幾乎聽不到', 'Bär [bɛːɐ̯]'],
      ['aɪ̯　aʊ̯　ɔɪ̯', '像「愛」／「凹」／「喔衣」', 'Eis　Auto　Eule'],
    ]],
    ['子音', [
      ['ʃ', '像「噓」，舌頭往後一點', 'Schaf [ʃaːf]'],
      ['ç', '輕輕的氣音「嘻」（ich 的 ch）', 'Mäppchen [ˈmɛpçən]'],
      ['x', '喉嚨後面摩擦的「喝」（Buch 的 ch）', 'Buch [buːx]'],
      ['ʁ', '喉嚨後面的 r，像輕輕漱口', 'Rakete [ʁaˈkeːtə]'],
      ['ŋ', '像 ng', 'Angel [ˈaŋl̩]'],
      ['ts　pf', '像「茨」／「噗」和「夫」連在一起', 'Zahn [tsaːn]　Apfel [ˈapfl̩]'],
      ['v', '德文的 w，要發成 v', 'Wal [vaːl]'],
      ['z　s', '有聲的 s，像「茲」／無聲的 s，像「斯」', 'Sonne [ˈzɔnə]　Bus [bʊs]'],
      ['j', '像「呀」', 'Jacke [ˈjakə]'],
      ['ʔ', '喉嚨輕輕停一下', 'Geodreieck [ˈɡeːoˌdʁaɪ̯ʔɛk]'],
      ['n̩　l̩', '字尾幾乎不發母音，直接發 n、l', 'Ampel [ˈampl̩]'],
    ]],
    ['冠詞', [
      ['der　die　das', '[deːɐ̯]　[diː]　[das]', '念起來像「得ㄦ」「滴」「搭斯」'],
    ]],
  ];

  function mountLegend(el) {
    if (!el) return;
    el.classList.add('ipa-legend');
    const composed = [...new Set(CARDS.filter(c => c.ipaComposed).map(c => c.noun))].sort();
    el.innerHTML = `<summary>德文音標（IPA）怎麼看</summary>` +
      ROWS.map(([group, rows]) => `<h4>${group}</h4>` +
        rows.map(([s, like, ex]) => `<div class="row"><span class="sym">${esc(s)}</span><span>${esc(like)}<span class="ex" lang="de-fonipa">${esc(ex)}</span></span></div>`).join('')).join('') +
      `<p class="src">音標（IPA）來自德文維基詞典（de.wiktionary.org）。以國語對照只是「大約像」，要以示範發音為準。` +
      (composed.length ? `有 * 的字（${composed.join('、')}）字典裡沒有，是依組成的字拼出來的，可能和字典略有不同。` : '') + `</p>`;
  }

  mountLegend(document.getElementById('ipaLegend'));
  return {text, html, mountLegend};
})();
