import type { Chip, Explanation, ExplanationStep, PlaceCol, PlaceValueScene } from './scene';

/**
 * 小二 1000 以內：位值表（百／十／個）上的圓片。
 * Used whenever an addition or subtraction has a number above 100; up to 100 the base-ten
 * blocks in explanations.ts are used instead.
 */

const VALUE: Record<PlaceCol, 1 | 10 | 100> = { h: 100, t: 10, o: 1 };
const COL_NAME: Record<PlaceCol, string> = { h: '百位', t: '十位', o: '個位' };
const UNIT: Record<PlaceCol, string> = { h: '百', t: '十', o: '一' };
const NEXT: Record<'o' | 't', 'h' | 't'> = { o: 't', t: 'h' };

const digits = (n: number) => ({ h: Math.floor(n / 100), t: Math.floor(n / 10) % 10, o: n % 10 });
export const describeHTO = (n: number) => {
  const d = digits(n);
  return `${d.h} 個百、${d.t} 個十、${d.o} 個一`;
};

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

let counter = 0;
function step(caption: string, scene: PlaceValueScene, durationMs = 2400): ExplanationStep {
  counter += 1;
  return { id: `pv${counter}`, caption, scene, durationMs };
}

function chipsFor(prefix: string, n: number, color: Chip['color'], zone: 'main' | 'second'): Chip[] {
  const d = digits(n);
  const out: Chip[] = [];
  for (const col of ['h', 't', 'o'] as PlaceCol[]) {
    for (let i = 0; i < d[col]; i++) out.push({ id: `${prefix}${col}${i}`, value: VALUE[col], color, place: { zone, col, slot: i } });
  }
  return out;
}

/** Counters that still count in a column (not taken away, not merged, not mid-move). */
function live(chips: Chip[], col: PlaceCol) {
  return chips
    .filter(c => c.place.zone === 'main' && c.place.col === col && !c.place.stack && !c.hidden && !c.removed)
    .sort((x, y) => x.place.slot - y.place.slot);
}

/** Next free slot in a column, after everything still drawn there (crossed-out counters included). */
function nextSlot(chips: Chip[], col: PlaceCol) {
  const used = chips.filter(c => c.place.zone === 'main' && c.place.col === col && !c.place.stack && !c.hidden);
  return used.length ? Math.max(...used.map(c => c.place.slot)) + 1 : 0;
}

function compact(chips: Chip[], col: PlaceCol) {
  chips
    .filter(c => c.place.zone === 'main' && c.place.col === col && !c.place.stack && !c.hidden)
    .sort((x, y) => x.place.slot - y.place.slot)
    .forEach((c, i) => (c.place = { ...c.place, slot: i }));
}

export function placeValueAdd(a: number, b: number): Explanation {
  const sum = a + b;
  const da = digits(a);
  const db = digits(b);
  const chips: Chip[] = [...chipsFor('a', a, 'a', 'main'), ...chipsFor('b', b, 'b', 'second')];
  const scene = (mainLabel: string, secondLabel?: string, total?: number): PlaceValueScene => ({ kind: 'placevalue', chips: clone(chips), mainLabel, secondLabel, total });

  const steps: ExplanationStep[] = [step(`${a} 是 ${describeHTO(a)}；${b} 是 ${describeHTO(b)}。${a} + ${b} = ?`, scene(`${a}`, `${b}`), 3200)];

  // Move the second number into the first, column by column.
  for (const col of ['h', 't', 'o'] as PlaceCol[]) {
    let slot = nextSlot(chips, col);
    chips.filter(c => c.place.zone === 'second' && c.place.col === col).forEach(c => (c.place = { zone: 'main', col, slot: slot++ }));
  }
  steps.push(step(`合在一起：百位 ${da.h} + ${db.h}，十位 ${da.t} + ${db.t}，個位 ${da.o} + ${db.o}。`, scene(`百 ${da.h + db.h}、十 ${da.t + db.t}、一 ${da.o + db.o}`)));

  for (const col of ['o', 't'] as const) {
    const here = live(chips, col);
    if (here.length < 10) continue;
    const up = NEXT[col];
    const target = nextSlot(chips, up);
    const bundle = here.slice(0, 10);
    bundle.forEach(c => (c.place = { zone: 'main', col: up, slot: target, stack: true }));
    steps.push(step(`${COL_NAME[col]}有 ${here.length} 個，滿 10 了！把 10 個${UNIT[col]}收在一起。`, scene(`${COL_NAME[col]}滿 10`)));
    bundle.forEach(c => (c.hidden = true));
    chips.push({ id: `carry-${col}`, value: VALUE[up], color: 'c', place: { zone: 'main', col: up, slot: target } });
    compact(chips, col);
    steps.push(step(`10 個${UNIT[col]}換成 1 個${UNIT[up]}，放到${COL_NAME[up]}（進位）。`, scene(`百 ${live(chips, 'h').length}、十 ${live(chips, 't').length}、一 ${live(chips, 'o').length}`)));
  }

  const ds = digits(sum);
  steps.push(step(`${a} + ${b} = ${sum}（${ds.h} 個百、${ds.t} 個十、${ds.o} 個一）`, scene(`一共 ${sum}`, undefined, sum), 3400));
  return { steps, hintStep: 1 };
}

export function placeValueSubtract(a: number, b: number): Explanation {
  const diff = a - b;
  const db = digits(b);
  const chips: Chip[] = chipsFor('a', a, 'a', 'main');
  const scene = (mainLabel: string, total?: number): PlaceValueScene => ({ kind: 'placevalue', chips: clone(chips), mainLabel, total });
  const status = () => `百 ${live(chips, 'h').length}、十 ${live(chips, 't').length}、一 ${live(chips, 'o').length}`;
  let fresh = 0;

  const steps: ExplanationStep[] = [step(`${a} 是 ${describeHTO(a)}。要拿走 ${b}（${describeHTO(b)}）。${a} − ${b} = ?`, scene(`${a}`), 3200)];

  /** Gives `col` ten more counters by breaking one counter of the next column (borrowing further up if needed). */
  const borrow = (col: 'o' | 't', forCol?: 'o') => {
    const up = NEXT[col];
    if (live(chips, up).length === 0) borrow(up as 't', col as 'o');
    const source = live(chips, up).pop()!;
    const at = source.place.slot;
    source.hidden = true;
    const made: Chip[] = Array.from({ length: 10 }, () => ({ id: `n${fresh++}`, value: VALUE[col], color: 'c', place: { zone: 'main', col: up, slot: at, stack: true } }));
    chips.push(...made);
    const why = forCol
      ? `${COL_NAME[forCol]}不夠拿，可是${COL_NAME[col]}一個都沒有，所以先從${COL_NAME[up]}借 1 個${UNIT[up]}，換成 10 個${UNIT[col]}（退位）。`
      : `${COL_NAME[col]}不夠拿，從${COL_NAME[up]}借 1 個${UNIT[up]}，換成 10 個${UNIT[col]}（退位）。`;
    steps.push(step(why, scene(status())));
    let slot = nextSlot(chips, col);
    made.forEach(c => (c.place = { zone: 'main', col, slot: slot++ }));
    steps.push(step(`現在${COL_NAME[col]}有 ${live(chips, col).length} 個${UNIT[col]}。`, scene(status())));
  };

  for (const col of ['o', 't', 'h'] as PlaceCol[]) {
    const need = db[col];
    if (need === 0) continue;
    if (live(chips, col).length < need) borrow(col as 'o' | 't');
    live(chips, col).slice(-need).forEach(c => (c.removed = true));
    steps.push(step(`拿走 ${need} 個${UNIT[col]}（打叉的是拿走的）。`, scene(status())));
  }

  steps.push(step(`剩下 ${describeHTO(diff)}：${a} − ${b} = ${diff}`, scene(`剩下 ${diff}`, diff), 3400));
  return { steps, hintStep: 1 };
}

/** Two hints for questions above 100, neither stating the final answer. */
export function placeValueHints(op: 'add' | 'subtract', a: number, b: number): [string, string] {
  const da = digits(a);
  const db = digits(b);
  if (op === 'add') {
    return ['從個位開始，一位一位加：個位、十位、百位。滿 10 就進位到左邊那一位。', `個位 ${da.o} + ${db.o} = ?；十位 ${da.t} + ${db.t} = ?（記得加上進位）；百位 ${da.h} + ${db.h} = ?`];
  }
  return ['從個位開始，一位一位減。不夠減就向左邊那一位借 1，換成 10。', `個位 ${da.o} − ${db.o}：夠不夠減？十位 ${da.t} − ${db.t}：夠不夠減？不夠的先借位，再算。`];
}
