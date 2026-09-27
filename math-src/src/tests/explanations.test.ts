import { describe, expect, it } from 'vitest';
import { generateExplanation, getHints } from '../math/explanations';
import { summarize, type SceneState } from '../math/scene';
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

  it('3 × 4 ends with 3 lit groups of 4', () => {
    const ex = generateExplanation(q(2, 'multiply', 3, 4));
    const fin = ex.steps[ex.steps.length - 1];
    expect(summarize(fin.scene)).toMatchObject({ groups: 3, perGroup: 4, lit: 3, value: 12 });
    expect(ex.steps.map(s => (s.scene.kind === 'array' ? s.scene.readout : ''))).toContain('4 + 4 + 4 = 12');
    expect(fin.caption).toContain('3 × 4 = 4 + 4 + 4 = 12');
  });

  it('every valid question of both grades ends at the correct answer, never negative', () => {
    const all: Question[] = [];
    for (let a = 0; a <= 20; a++) for (let b = 0; b <= 20; b++) for (const op of ['add', 'subtract'] as Operator[]) if (validateQuestion(1, op, a, b).ok) all.push(q(1, op, a, b));
    for (let a = 0; a <= 100; a++) for (let b = 0; b <= 100; b++) for (const op of ['add', 'subtract'] as Operator[]) if (validateQuestion(2, op, a, b).ok) all.push(q(2, op, a, b));
    for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) all.push(q(2, 'multiply', a, b));
    expect(all.length).toBeGreaterThan(10000);
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
  });

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
