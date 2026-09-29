// Checks what the speech recognizer heard against a card ("die Eule").
// Shared by speak.html (說說看) and game.html (遊戲).
const SpeechMatch = (() => {
  // words the recognizer often returns instead of the article
  const ARTICLE_ALIASES = {der: 'der', die: 'die', das: 'das', dass: 'das', di: 'die', dir: 'der'};

  function norm(s) {
    return s.toLowerCase().normalize('NFC').replace(/ß/g, 'ss').replace(/[^a-zäöü\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const fold = s => s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u');

  function similarity(a, b) {
    a = fold(a); b = fold(b);
    if (!a || !b) return 0;
    if (a === b) return 1;
    const d = Array.from({length: a.length + 1}, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return 1 - d[a.length][b.length] / Math.max(a.length, b.length);
  }

  /** Lenient on the noun (children's speech is often misheard), strict on the article. */
  function judge(transcript, card) {
    const tokens = norm(transcript).split(' ').filter(Boolean);
    const idx = tokens.findIndex(t => ARTICLE_ALIASES[t]);
    const said = idx >= 0 ? ARTICLE_ALIASES[tokens[idx]] : null;
    const rest = (idx >= 0 ? tokens.slice(idx + 1) : tokens).join('');
    const target = norm(card.noun).replace(/\s/g, '');
    let score = similarity(rest, target);
    if (rest.includes(fold(target)) || fold(rest).includes(fold(target))) score = Math.max(score, .95);
    return {said, articleOk: said === card.art, nounOk: score >= .72, score, transcript};
  }

  /** Picks the recognizer alternative that fits the card best. */
  function best(alternatives, card) {
    return alternatives.map(t => judge(t, card)).sort((a, b) =>
      (b.articleOk + b.nounOk * 1.5 + b.score) - (a.articleOk + a.nounOk * 1.5 + a.score))[0];
  }

  return {judge, best};
})();
