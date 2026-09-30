// Date filter chips shared by the card, speaking and game pages.
// Each card's `date` is the day its source photo came in (see cards.js).
const DateFilter = (() => {
  const WEEKDAY = '日一二三四五六';

  function dates() {
    // Skip cards without a date (e.g. an old cached cards.js) instead of failing.
    return [...new Set(CARDS.map(c => c.date).filter(Boolean))].sort();
  }

  /** "2026-09-30" → "9/30（三）" */
  function label(d) {
    const [y, m, day] = d.split('-').map(Number);
    return `${m}/${day}（${WEEKDAY[new Date(y, m - 1, day).getDay()]}）`;
  }

  /** Adds 所有日期 + one chip per date to `el`; calls onChange('all' | 'YYYY-MM-DD'). */
  function mount(el, onChange, {counts = false} = {}) {
    const all = dates();
    if (!all.length) { el.hidden = true; return; }
    const newest = all[all.length - 1];
    const chip = (d, html) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip date';
      b.dataset.d = d;
      b.setAttribute('aria-pressed', String(d === 'all'));
      b.innerHTML = html;
      return b;
    };
    el.append(chip('all', '所有日期'));
    for (const d of all) {
      const n = counts ? `<span class="n">${CARDS.filter(c => c.date === d).length}</span>` : '';
      el.append(chip(d, `${label(d)}${d === newest ? ' 新' : ''}${n}`));
    }
    el.addEventListener('click', e => {
      const b = e.target.closest('.chip.date');
      if (!b) return;
      el.querySelectorAll('.chip.date').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      onChange(b.dataset.d);
    });
  }

  return {dates, label, mount};
})();
