import { crossesTen, needsRegrouping, usesPlaceValue, usesTenFrames, type Question } from './types';
import { placeValueAdd, placeValueHints, placeValueSubtract } from './placevalue';
import type { Block, BlocksScene, Dot, DotsScene, Explanation, ExplanationStep, SceneState } from './scene';

let stepCounter = 0;
function step(caption: string, scene: SceneState, durationMs = 2200): ExplanationStep {
  stepCounter += 1;
  return { id: `s${stepCounter}`, caption, scene, durationMs };
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

/** Builds the step-by-step explanation for any valid question, preset or custom. */
export function generateExplanation(q: Question): Explanation {
  if (q.operator === 'multiply') return multiply(q.left, q.right);
  if (usesTenFrames(q)) return q.operator === 'add' ? g1Add(q.left, q.right) : g1Subtract(q.left, q.right);
  if (usesPlaceValue(q)) return q.operator === 'add' ? placeValueAdd(q.left, q.right) : placeValueSubtract(q.left, q.right);
  return q.operator === 'add' ? g2Add(q.left, q.right) : g2Subtract(q.left, q.right);
}

// ---------------------------------------------------------------- 小一：小圓點與十格框

function g1Add(a: number, b: number): Explanation {
  const sum = a + b;
  const dots: Dot[] = [
    ...Array.from({ length: a }, (_, i): Dot => ({ id: `a${i}`, color: 'a', place: { area: 'frame', slot: i } })),
    ...Array.from({ length: b }, (_, i): Dot => ({ id: `b${i}`, color: 'b', place: { area: 'side', slot: i } })),
  ];
  const scene = (frameLabel: string, sideLabel?: string, total?: number): DotsScene => ({ kind: 'dots', dots: clone(dots), frameLabel, sideLabel, total });
  const moveB = (from: number, to: number) => {
    for (let i = from; i < to; i++) dots[a + i].place = { area: 'frame', slot: a + i };
  };

  const steps: ExplanationStep[] = [step(`藍點 ${a} 個，橘點 ${b} 個。${a} + ${b} = ?`, scene(`藍點 ${a} 個`, `橘點 ${b} 個`), 2600)];
  if (b === 0) {
    steps.push(step(`沒有橘點要加，還是 ${a} 個。${a} + 0 = ${a}`, scene(`${a} 個`, undefined, sum)));
    return { steps, hintStep: 0 };
  }
  if (a < 10 && sum > 10) {
    const k = 10 - a;
    moveB(0, k);
    steps.push(step(`先拿 ${k} 個橘點，把第一個十格框填滿：${a} 再加 ${k}，就湊成 10。`, scene('10 個', `還剩 ${b - k} 個`)));
    moveB(k, b);
    steps.push(step(`剩下的 ${b - k} 個放進第二個十格框：10 再加 ${b - k}。`, scene(`10 和 ${b - k}`)));
    steps.push(step(`${a} + ${b} = 10 + ${b - k} = ${sum}`, scene(`一共 ${sum} 個`, undefined, sum), 3000));
    return { steps, hintStep: 1 };
  }
  moveB(0, b);
  const caption = a < 10 && sum === 10 ? `${a} 再加 ${b}，剛好把十格框填滿，湊成 10。` : `把 ${b} 個橘點一個一個放進格子裡，接著數下去。`;
  steps.push(step(caption, scene(`數一數`)));
  steps.push(step(`${a} + ${b} = ${sum}`, scene(`一共 ${sum} 個`, undefined, sum), 3000));
  return { steps, hintStep: 1 };
}

function g1Subtract(a: number, b: number): Explanation {
  const diff = a - b;
  const dots: Dot[] = Array.from({ length: a }, (_, i): Dot => ({ id: `a${i}`, color: 'a', place: { area: 'frame', slot: i } }));
  const scene = (frameLabel: string, total?: number): DotsScene => ({ kind: 'dots', dots: clone(dots), frameLabel, total });
  // Take away from the highest slot down, so the first ten-frame stays full as long as possible.
  const remove = (n: number) => {
    const live = dots.filter(d => !d.removed).sort((x, y) => y.place.slot - x.place.slot);
    live.slice(0, n).forEach(d => (d.removed = true));
  };

  const steps: ExplanationStep[] = [step(`有 ${a} 個點，要拿走 ${b} 個。${a} − ${b} = ?`, scene(`${a} 個`), 2600)];
  if (b === 0) {
    steps.push(step(`一個都不拿，還是 ${a} 個。${a} − 0 = ${a}`, scene(`${a} 個`, diff)));
    return { steps, hintStep: 0 };
  }
  if (a > 10 && b > a - 10) {
    const x = a - 10;
    const y = b - x;
    remove(x);
    steps.push(step(`先拿走第二個十格框的 ${x} 個，剩下 10 個。`, scene('剩 10 個')));
    remove(y);
    steps.push(step(`還要再拿走 ${y} 個：從 10 個裡拿走 ${y} 個。`, scene(`剩 ${10 - y} 個`)));
    steps.push(step(`${a} − ${b} = 10 − ${y} = ${diff}`, scene(`剩下 ${diff} 個`, diff), 3000));
    return { steps, hintStep: 1 };
  }
  remove(b);
  steps.push(step(`拿走 ${b} 個（打叉的是拿走的）。`, scene(diff === 0 ? '全部拿走了' : '數一數剩幾個')));
  steps.push(step(diff === 0 ? `全部拿走了，剩下 0 個：${a} − ${b} = 0` : `${a} − ${b} = ${diff}`, scene(`剩下 ${diff} 個`, diff), 3000));
  return { steps, hintStep: 1 };
}

// ---------------------------------------------------------------- 小二：十位積木與個位小方塊

function blocksFor(prefix: string, n: number, color: Block['color'], zone: Block['place']['zone']): Block[] {
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return [
    ...Array.from({ length: tens }, (_, i): Block => ({ id: `${prefix}t${i}`, kind: 'ten', color, place: { zone, slot: i } })),
    ...Array.from({ length: ones }, (_, i): Block => ({ id: `${prefix}o${i}`, kind: 'one', color, place: { zone, slot: i } })),
  ];
}

const tensOf = (n: number) => Math.floor(n / 10);
const onesOf = (n: number) => n % 10;
const describe = (n: number) => `${tensOf(n)} 條十位和 ${onesOf(n)} 個個位`;

function g2Add(a: number, b: number): Explanation {
  const sum = a + b;
  const [ta, oa, tb, ob] = [tensOf(a), onesOf(a), tensOf(b), onesOf(b)];
  let blocks: Block[] = [...blocksFor('a', a, 'a', 'main'), ...blocksFor('b', b, 'b', 'second')];
  const scene = (mainLabel: string, secondLabel?: string, total?: number): BlocksScene => ({ kind: 'blocks', blocks: clone(blocks), mainLabel, secondLabel, total });

  const steps: ExplanationStep[] = [
    step(`${a} 是 ${describe(a)}；${b} 是 ${describe(b)}。${a} + ${b} = ?`, scene(`${a}`, `${b}`), 3000),
  ];

  // Move the second number up into the first: tens after tens, ones after ones.
  blocks = blocks.map(bl => {
    if (bl.place.zone !== 'second') return bl;
    const slot = bl.kind === 'ten' ? ta + bl.place.slot : oa + bl.place.slot;
    return { ...bl, place: { zone: 'main', slot } };
  });
  const tens = ta + tb;
  const ones = oa + ob;
  steps.push(step(`合在一起：十位 ${ta} + ${tb} = ${tens} 條，個位 ${oa} + ${ob} = ${ones} 個。`, scene(`${tens} 條十位、${ones} 個個位`)));

  if (ones >= 10) {
    const onesSorted = blocks.filter(bl => bl.kind === 'one').sort((x, y) => x.place.slot - y.place.slot);
    const ten = onesSorted.slice(0, 10);
    const rest = onesSorted.slice(10);
    ten.forEach((bl, i) => (bl.place = { zone: 'main', slot: i, column: tens }));
    steps.push(step(`個位有 ${ones} 個，滿 10 了！把其中 10 個排成一條。`, scene(`${tens} 條十位、${ones} 個個位`)));
    ten.forEach(bl => (bl.hidden = true));
    rest.forEach((bl, i) => (bl.place = { zone: 'main', slot: i }));
    blocks.push({ id: 'carry', kind: 'ten', color: 'c', place: { zone: 'main', slot: tens } });
    steps.push(step(`10 個個位合成 1 條十位（進位）。現在是 ${tens + 1} 條十位、${ones - 10} 個個位。`, scene(`${tens + 1} 條十位、${ones - 10} 個個位`)));
    steps.push(step(`${tens * 10} + ${ones} = ${(tens + 1) * 10} + ${ones - 10} = ${sum}`, scene(`一共 ${sum}`, undefined, sum), 3200));
    return { steps, hintStep: 1 };
  }
  steps.push(step(`${tens * 10} + ${ones} = ${sum}`, scene(`一共 ${sum}`, undefined, sum), 3200));
  return { steps, hintStep: 1 };
}

function g2Subtract(a: number, b: number): Explanation {
  const diff = a - b;
  const [ta, oa, tb, ob] = [tensOf(a), onesOf(a), tensOf(b), onesOf(b)];
  const blocks: Block[] = blocksFor('a', a, 'a', 'main');
  const scene = (mainLabel: string, total?: number): BlocksScene => ({ kind: 'blocks', blocks: clone(blocks), mainLabel, total });
  const takeText = tb > 0 && ob > 0 ? `${tb} 條十位和 ${ob} 個個位` : tb > 0 ? `${tb} 條十位` : `${ob} 個個位`;

  const steps: ExplanationStep[] = [
    step(`${a} 是 ${describe(a)}。要拿走 ${b}，也就是 ${takeText}。${a} − ${b} = ?`, scene(`${a}`), 3000),
  ];

  let tensLeft = ta;
  let onesNow = oa;
  if (oa < ob) {
    // Break one ten into ten ones: first show them where the bar was, then move them into the ones grid.
    const bar = blocks.filter(bl => bl.kind === 'ten' && !bl.hidden).sort((x, y) => y.place.slot - x.place.slot)[0];
    bar.hidden = true;
    const col = bar.place.slot;
    const fresh: Block[] = Array.from({ length: 10 }, (_, i) => ({ id: `n${i}`, kind: 'one', color: 'c', place: { zone: 'main', slot: i, column: col } }));
    blocks.push(...fresh);
    steps.push(step(`個位只有 ${oa} 個，不夠拿走 ${ob} 個。把 1 條十位拆成 10 個個位（退位）。`, scene(`${ta - 1} 條十位、${oa} + 10 個個位`)));
    fresh.forEach((bl, i) => (bl.place = { zone: 'main', slot: oa + i }));
    tensLeft = ta - 1;
    onesNow = oa + 10;
    steps.push(step(`現在是 ${tensLeft} 條十位和 ${onesNow} 個個位。`, scene(`${tensLeft} 條十位、${onesNow} 個個位`)));
  }

  const liveTens = blocks.filter(bl => bl.kind === 'ten' && !bl.hidden).sort((x, y) => y.place.slot - x.place.slot);
  const liveOnes = blocks.filter(bl => bl.kind === 'one' && !bl.hidden).sort((x, y) => y.place.slot - x.place.slot);
  liveTens.slice(0, tb).forEach(bl => (bl.removed = true));
  liveOnes.slice(0, ob).forEach(bl => (bl.removed = true));
  steps.push(step(`拿走 ${takeText}（打叉的是拿走的）。`, scene(`剩 ${tensLeft - tb} 條十位、${onesNow - ob} 個個位`)));
  const detail = oa < ob ? `${tensLeft * 10} + ${onesNow} − ${b} = ${(tensLeft - tb) * 10} + ${onesNow - ob} = ${diff}` : `${a} − ${b} = ${diff}`;
  steps.push(step(`剩下 ${describe(diff)}：${detail}`, scene(`剩下 ${diff}`, diff), 3200));
  return { steps, hintStep: 1 };
}

// ---------------------------------------------------------------- 小二：乘法點陣

function multiply(a: number, b: number): Explanation {
  const steps: ExplanationStep[] = [
    step(`${a} × ${b} 就是 ${a} 組，每組 ${b} 個。`, { kind: 'array', groups: a, perGroup: b, lit: 0, readout: `${a} 組 × 每組 ${b} 個` }, 2600),
  ];
  for (let i = 1; i <= a; i++) {
    const readout = i === 1 ? `${b}` : `${Array(i).fill(b).join(' + ')} = ${b * i}`;
    steps.push(step(i === 1 ? `第 1 組：${b} 個。` : `第 ${i} 組也亮起來：再加 ${b}，是 ${b * i} 個。`, { kind: 'array', groups: a, perGroup: b, lit: i, readout }, 1500));
  }
  steps.push(step(`${a} × ${b} = ${Array(a).fill(b).join(' + ')} = ${a * b}`, { kind: 'array', groups: a, perGroup: b, lit: a, readout: `${a} × ${b} = ${a * b}`, total: a * b }, 3200));
  return { steps, hintStep: Math.max(1, Math.ceil(a / 2)) };
}

// ---------------------------------------------------------------- 提示

/** Two levels: the strategy first, then a partial step. Neither states the final answer. */
export function getHints(q: Question): [string, string] {
  const { left: a, right: b } = q;
  if (q.operator !== 'multiply' && usesPlaceValue(q)) return placeValueHints(q.operator, a, b);
  if (q.operator === 'multiply') return [`${a} × ${b} 就是 ${a} 組，每組 ${b} 個。可以一組一組加起來。`, `${Array(a).fill(b).join(' + ')} = ?`];
  if (usesTenFrames(q)) {
    if (q.operator === 'add') {
      if (a < 10 && crossesTen(q)) return [`先湊成 10：${a} 再加幾個會變成 10？`, `${a} + ${10 - a} = 10，${b} 還剩下 ${b - (10 - a)}。10 + ${b - (10 - a)} = ?`];
      return [`從 ${a} 開始，往後數 ${b} 個。`, `${a} 後面接著數：${Array.from({ length: Math.min(b, 3) }, (_, i) => a + i + 1).join('、')}${b > 3 ? '……' : ''}，數到第 ${b} 個是多少？`];
    }
    if (a > 10 && b > a - 10) return ['先減到 10，再繼續減。', `${a} − ${a - 10} = 10，還要再減 ${b - (a - 10)}。10 − ${b - (a - 10)} = ?`];
    return [`從 ${a} 個裡拿走 ${b} 個，數數看剩幾個。`, `從 ${a} 往回數 ${b} 個：${Array.from({ length: Math.min(b, 3) }, (_, i) => a - i - 1).join('、')}${b > 3 ? '……' : ''}`];
  }
  const [ta, oa, tb, ob] = [tensOf(a), onesOf(a), tensOf(b), onesOf(b)];
  if (q.operator === 'add') {
    if (needsRegrouping(q)) return ['先算個位，再算十位。個位滿 10 就要進位到十位。', `個位 ${oa} + ${ob} = ${oa + ob}，滿 10 進 1。十位 ${ta} + ${tb} + 1 = ?`];
    return ['先算個位，再算十位。', `個位 ${oa} + ${ob} = ${oa + ob}，十位 ${ta} + ${tb} = ${ta + tb}。合起來是多少？`];
  }
  if (needsRegrouping(q)) return ['個位不夠減的時候，從十位借 1 條，拆成 10 個個位。', `${a} 可以看成 ${ta - 1} 條十位和 ${oa + 10} 個個位。個位 ${oa + 10} − ${ob} = ${oa + 10 - ob}，十位 ${ta - 1} − ${tb} = ?`];
  return ['先算個位，再算十位。', `個位 ${oa} − ${ob} = ${oa - ob}，十位 ${ta} − ${tb} = ${ta - tb}。合起來是多少？`];
}
