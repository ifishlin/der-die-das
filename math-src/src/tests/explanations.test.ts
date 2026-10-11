import { describe, expect, it } from 'vitest';
import { generateExplanation, getHints } from '../math/explanations';
import { summarize, type BlocksScene, type SceneState } from '../math/scene';
import { answerOf, type Grade, type Operator, type Question } from '../math/types';
import { validateQuestion } from '../math/validation';
import { GRADE1_PRESET, GRADE2_MULTIPLY, GRADE2_PRESET } from '../math/presets';

const q = (grade: Grade, operator: Operator, left: number, right: number): Question => ({ id: 't', grade, operator, left, right, tags: [] });
const finalScene = (question: Question): SceneState => {
  const steps = generateExplanation(question).steps;
  return steps[steps.length - 1].scene;
};

describe('explanation animations end in the right picture', () => {
  it('8 + 5 ends with 13 dots, via making ten', () => {
    const ex = generateExplanation(q(1, 'add', 8, 5));
    const fin = summarize(ex.steps[ex.steps.length - 1].scene);
    expect(fin).toMatchObject({ kind: 'dots', units: 13 });
    const makeTen = ex.steps[1].scene;
    if (makeTen.kind !== 'dots') throw new Error('dots');
    expect(makeTen.dots.filter(d => d.place.area === 'frame' && d.place.slot < 10)).toHaveLength(10);
    expect(ex.steps[1].caption).toContain('湊成 10');
  });

  it('13 − 6 ends with 7 dots, taken from the original 13', () => {
    const ex = generateExplanation(q(1, 'subtract', 13, 6));
    const first = ex.steps[0].scene;
    const last = ex.steps[ex.steps.length - 1].scene;
    if (first.kind !== 'dots' || last.kind !== 'dots') throw new Error('dots');
    expect(first.dots).toHaveLength(13);
    expect(last.dots.map(d => d.id)).toEqual(first.dots.map(d => d.id));
    expect(summarize(last).value).toBe(7);
    expect(last.dots.filter(d => d.removed)).toHaveLength(6);
  });

  it('7 − 7 shows an empty set and 0', () => {
    const fin = finalScene(q(1, 'subtract', 7, 7));
    expect(summarize(fin).value).toBe(0);
    expect(fin.total).toBe(0);
  });

  it('37 + 16 ends with 5 tens and 3 ones after a carry', () => {
    const ex = generateExplanation(q(2, 'add', 37, 16));
    expect(summarize(ex.steps[ex.steps.length - 1].scene)).toMatchObject({ tens: 5, ones: 3, value: 53 });
    expect(ex.steps.some(s => s.caption.includes('合成 1 條十位'))).toBe(true);
    // Right before the merge, the 13 ones are all still there.
    expect(summarize(ex.steps[1].scene)).toMatchObject({ tens: 4, ones: 13 });
  });

  it('52 − 27 ends with 2 tens and 5 ones after a borrow', () => {
    const ex = generateExplanation(q(2, 'subtract', 52, 27));
    expect(summarize(ex.steps[ex.steps.length - 1].scene)).toMatchObject({ tens: 2, ones: 5, value: 25 });
    const afterBorrow = ex.steps.find(s => s.caption.startsWith('現在是'));
    expect(afterBorrow && summarize(afterBorrow.scene)).toMatchObject({ tens: 4, ones: 12 });
  });

  it('100 − 58 is 9 tens + 10 ones after the borrow and ends at 42', () => {
    const ex = generateExplanation(q(2, 'subtract', 100, 58));
    const afterBorrow = ex.steps.find(s => s.caption.startsWith('現在是'));
    expect(afterBorrow && summarize(afterBorrow.scene)).toMatchObject({ tens: 9, ones: 10 });
    expect(summarize(ex.steps[ex.steps.length - 1].scene).value).toBe(42);
  });

  it('grade 1 uses ten-frames up to 20 and base-ten blocks above 20', () => {
    expect(finalScene(q(1, 'add', 9, 7)).kind).toBe('dots');
    expect(finalScene(q(1, 'add', 20, 0)).kind).toBe('dots');
    expect(finalScene(q(1, 'add', 19, 8)).kind).toBe('blocks');
    expect(summarize(finalScene(q(1, 'add', 37, 16)))).toMatchObject({ tens: 5, ones: 3 });
    expect(summarize(finalScene(q(1, 'subtract', 100, 58))).value).toBe(42);
  });

  it('grade 2 above 100 uses the place-value chart with carries and borrows', () => {
    const add = generateExplanation(q(2, 'add', 458, 276));
    expect(add.steps[0].scene.kind).toBe('placevalue');
    expect(summarize(add.steps[add.steps.length - 1].scene)).toMatchObject({ hundreds: 7, tens: 3, ones: 4, value: 734 });
    expect(add.steps.filter(s => s.caption.includes('進位')).length).toBe(2); // ones → tens, tens → hundreds

    const to1000 = generateExplanation(q(2, 'add', 999, 1));
    expect(summarize(to1000.steps[to1000.steps.length - 1].scene)).toMatchObject({ hundreds: 10, tens: 0, ones: 0, value: 1000 });

    const zero = generateExplanation(q(2, 'subtract', 503, 278));
    expect(zero.steps.filter(s => s.caption.includes('退位')).length).toBe(2); // borrow a hundred, then a ten
    expect(summarize(zero.steps[zero.steps.length - 1].scene).value).toBe(225);

    const k = generateExplanation(q(2, 'subtract', 1000, 1));
    expect(summarize(k.steps[k.steps.length - 1].scene)).toMatchObject({ hundreds: 9, tens: 9, ones: 9 });

    // up to 100 keeps the base-ten blocks
    expect(generateExplanation(q(2, 'subtract', 100, 58)).steps[0].scene.kind).toBe('blocks');
  });

  it('3 × 4 ends with 3 lit groups of 4', () => {
    const ex = generateExplanation(q(2, 'multiply', 3, 4));
    const fin = ex.steps[ex.steps.length - 1];
    expect(summarize(fin.scene)).toMatchObject({ groups: 3, perGroup: 4, lit: 3, value: 12 });
    expect(ex.steps.map(s => (s.scene.kind === 'array' ? s.scene.readout : ''))).toContain('4 + 4 + 4 = 12');
    expect(fin.caption).toContain('3 × 4 = 4 + 4 + 4 = 12');
  });

  it('every valid question of both grades ends at the correct answer, never negative', () => {
    const all: Question[] = [];
    for (let a = 0; a <= 100; a++) for (let b = 0; b <= 100; b++) for (const op of ['add', 'subtract'] as Operator[]) if (validateQuestion(1, op, a, b).ok) all.push(q(1, op, a, b));
    for (let a = 0; a <= 100; a++) for (let b = 0; b <= 100; b++) for (const op of ['add', 'subtract'] as Operator[]) if (validateQuestion(2, op, a, b).ok) all.push(q(2, op, a, b));
    for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) all.push(q(2, 'multiply', a, b));
    expect(all.length).toBeGreaterThan(20000);
    for (const question of all) {
      const ex = generateExplanation(question);
      const fin = ex.steps[ex.steps.length - 1].scene;
      expect(summarize(fin).value, JSON.stringify(question)).toBe(answerOf(question));
      expect(fin.total).toBe(answerOf(question));
      expect(ex.hintStep).toBeGreaterThanOrEqual(0);
      expect(ex.hintStep).toBeLessThan(ex.steps.length - 1 || 1);
      for (const s of ex.steps) {
        const sum = summarize(s.scene);
        expect(sum.value).toBeGreaterThanOrEqual(0);
        if (s.scene.kind === 'blocks') {
          // ones grid is 5 × 4; never more than 19 loose ones at once
          const ones = s.scene.blocks.filter(bl => bl.kind === 'one' && !bl.hidden && bl.place.column === undefined);
          expect(Math.max(-1, ...ones.map(o => o.place.slot))).toBeLessThan(20);
        }
        if (s.scene.kind === 'dots') {
          expect(Math.max(-1, ...s.scene.dots.map(d => d.place.slot))).toBeLessThan(20);
        }
      }
    }
  }, 60_000);

  it('random 3-digit questions end at the right answer, with every column fitting its 5 × 4 grid', () => {
    let seed = 12345;
    const rnd = (n: number) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
    for (let i = 0; i < 4000; i++) {
      const a = 1 + rnd(1000);
      const op: Operator = rnd(2) ? 'add' : 'subtract';
      const b = op === 'add' ? rnd(1001 - a) : rnd(a + 1);
      const question = q(2, op, a, b);
      if (!validateQuestion(2, op, a, b).ok) continue;
      const ex = generateExplanation(question);
      expect(summarize(ex.steps[ex.steps.length - 1].scene).value, `${a} ${op} ${b}`).toBe(answerOf(question));
      for (const st of ex.steps) {
        if (st.scene.kind !== 'placevalue') continue;
        const placed = st.scene.chips.filter(c => !c.hidden && !c.place.stack);
        expect(Math.max(-1, ...placed.map(c => c.place.slot)), `${a} ${op} ${b}: ${st.caption}`).toBeLessThan(20);
        expect(summarize(st.scene).value).toBeGreaterThanOrEqual(0);
      }
    }
  }, 60_000);

  it('subtraction takes the ones first, then the tens (26 − 12)', () => {
    const ex = generateExplanation(q(2, 'subtract', 26, 12));
    const taken = ex.steps.map(st => {
      const blocks = (st.scene as BlocksScene).blocks;
      return { ones: blocks.filter(b => b.removed && b.kind === 'one').length, tens: blocks.filter(b => b.removed && b.kind === 'ten').length };
    });
    expect(taken).toEqual([{ ones: 0, tens: 0 }, { ones: 2, tens: 0 }, { ones: 2, tens: 1 }, { ones: 2, tens: 1 }]);
    expect(ex.steps[0].caption).toContain('先拿個位，再拿十位');
    expect(ex.steps[1].caption).toContain('先拿個位：把 2 個個位');
    expect(ex.steps[2].caption).toContain('再拿十位：把 1 條十位');
    expect(summarize(ex.steps[1].scene)).toMatchObject({ tens: 2, ones: 4 }); // only the ones have left so far
    expect(summarize(ex.steps[2].scene)).toMatchObject({ tens: 1, ones: 4 });
  });

  it('when the ones are too few, borrow from the tens first, then take the ones, then the tens (52 − 27)', () => {
    const caps = generateExplanation(q(2, 'subtract', 52, 27)).steps.map(st => st.caption);
    const at = (needle: string) => caps.findIndex(c => c.includes(needle));
    expect(at('退位')).toBeGreaterThan(0);
    expect(at('先拿個位：把 7 個個位')).toBeGreaterThan(at('退位'));
    expect(at('再拿十位：把 2 條十位')).toBeGreaterThan(at('先拿個位'));
    expect(at('剩下')).toBe(caps.length - 1);
  });

  it('takes only the digit that exists, and nothing at all for − 0', () => {
    const only = (a: number, b: number) => generateExplanation(q(2, 'subtract', a, b)).steps.map(st => st.caption);
    const tensOnly = only(50, 20);
    expect(tensOnly).toHaveLength(3);
    expect(tensOnly[1]).toMatch(/^拿十位：把 2 條十位/);
    const onesOnly = only(27, 5);
    expect(onesOnly).toHaveLength(3);
    expect(onesOnly[1]).toMatch(/^拿個位：把 5 個個位/);
    const none = generateExplanation(q(2, 'subtract', 52, 0));
    expect(none.steps).toHaveLength(3);
    expect(none.steps.every(st => !(st.scene as BlocksScene).blocks.some(b => b.removed))).toBe(true);
    expect(summarize(none.steps[none.steps.length - 1].scene).value).toBe(52);
  });

  it('place value goes ones → tens → hundreds, and a lone column is just "拿"', () => {
    const caps = generateExplanation(q(2, 'subtract', 658, 324)).steps.map(st => st.caption);
    const at = (needle: string) => caps.findIndex(c => c.includes(needle));
    expect(at('先拿個位：把 4 個一')).toBeGreaterThan(0);
    expect(at('再拿十位：把 2 個十')).toBeGreaterThan(at('先拿個位'));
    expect(at('最後拿百位：把 3 個百')).toBeGreaterThan(at('再拿十位'));
    const lone = generateExplanation(q(2, 'subtract', 700, 300)).steps.map(st => st.caption);
    expect(lone.some(c => c.startsWith('拿百位：把 3 個百'))).toBe(true);
  });

  it('the second hint never shows the finished subtraction', () => {
    const check = (question: Question) => {
      const ex = generateExplanation(question);
      const v = summarize(ex.steps[ex.hintStep].scene).value;
      expect(v, `${question.left} − ${question.right}`).not.toBe(answerOf(question));
      expect(ex.hintStep).toBeLessThan(ex.steps.length - 1);
    };
    for (let a = 1; a <= 100; a++) for (let b = 1; b <= a; b++) check(q(2, 'subtract', a, b));
    let seed = 99;
    const rnd = (n: number) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
    for (let i = 0; i < 1500; i++) { const a = 101 + rnd(900); check(q(2, 'subtract', a, 1 + rnd(a))); }
  }, 60_000);

  it('only the last step shows the answer', () => {
    for (const question of [...GRADE1_PRESET, ...GRADE2_PRESET, ...GRADE2_MULTIPLY]) {
      const steps = generateExplanation(question).steps;
      steps.slice(0, -1).forEach(s => expect(s.scene.total).toBeUndefined());
    }
  });

  it('hints never state the final answer as "= answer"', () => {
    for (const question of [...GRADE1_PRESET, ...GRADE2_PRESET, ...GRADE2_MULTIPLY]) {
      const ans = answerOf(question);
      for (const h of getHints(question)) expect(h.endsWith(`= ${ans}`)).toBe(false);
    }
  });
});
