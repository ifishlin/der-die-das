import { describe, expect, it } from 'vitest';
import { candidates, generateQuestions, pairKey, type GeneratorOptions } from '../math/generator';
import { answerOf, isRegrouping } from '../math/types';
import { validateQuestion } from '../math/validation';

/** Deterministic random so failures are reproducible. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const base: GeneratorOptions = { grade: 1, operation: 'addsub', maxNumber: 20, count: 20, difficulty: 'any' };

describe('question generator', () => {
  it('produces valid, unique questions for many settings', () => {
    const settings: GeneratorOptions[] = [
      base,
      { ...base, operation: 'add', difficulty: 'only' },
      { ...base, operation: 'subtract', difficulty: 'none', maxNumber: 10, count: 10 },
      { ...base, operation: 'addsub', maxNumber: 100, difficulty: 'only' },
      { grade: 2, operation: 'addsub', maxNumber: 100, count: 20, difficulty: 'only' },
      { grade: 2, operation: 'add', maxNumber: 100, count: 20, difficulty: 'none' },
      { grade: 2, operation: 'multiply', maxNumber: 100, maxFactor: 10, count: 20, difficulty: 'any' },
      { grade: 2, operation: 'all', maxNumber: 100, maxFactor: 5, count: 20, difficulty: 'any' },
      { grade: 2, operation: 'addsub', maxNumber: 1000, count: 20, difficulty: 'only' },
      { grade: 2, operation: 'addsub', maxNumber: 1000, count: 20, difficulty: 'none' },
      { grade: 2, operation: 'all', maxNumber: 1000, count: 20, difficulty: 'any' },
    ];
    for (const [i, opts] of settings.entries()) {
      for (let run = 0; run < 20; run++) {
        const res = generateQuestions(opts, seeded(i * 100 + run));
        expect(res.ok, JSON.stringify(opts)).toBe(true);
        if (!res.ok) continue;
        expect(res.questions).toHaveLength(opts.count);
        const keys = res.questions.map(q => pairKey(q));
        expect(new Set(keys).size).toBe(keys.length);
        for (const q of res.questions) {
          expect(validateQuestion(opts.grade, q.operator, q.left, q.right).ok).toBe(true);
          expect(answerOf(q)).toBeGreaterThanOrEqual(0);
          if (q.operator !== 'multiply') {
            expect(Math.max(q.left, q.right, answerOf(q))).toBeLessThanOrEqual(opts.maxNumber);
            const hard = isRegrouping(q);
            if (opts.difficulty === 'only') expect(hard).toBe(true);
            if (opts.difficulty === 'none') expect(hard).toBe(false);
          } else {
            expect(q.left).toBeLessThanOrEqual(opts.maxFactor ?? 10);
            expect(q.right).toBeLessThanOrEqual(opts.maxFactor ?? 10);
            expect(answerOf(q)).toBeLessThanOrEqual(100);
          }
        }
      }
    }
  });

  it('spreads mixed operations evenly', () => {
    const res = generateQuestions({ grade: 2, operation: 'all', maxNumber: 100, count: 20, difficulty: 'any' }, seeded(7));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const n = (op: string) => res.questions.filter(q => q.operator === op).length;
    expect([n('add'), n('subtract'), n('multiply')].sort()).toEqual([6, 7, 7]);
  });

  it('treats 3 + 4 and 4 + 3 as the same question', () => {
    expect(pairKey({ operator: 'add', left: 3, right: 4 })).toBe(pairKey({ operator: 'add', left: 4, right: 3 }));
    expect(pairKey({ operator: 'multiply', left: 2, right: 9 })).toBe(pairKey({ operator: 'multiply', left: 9, right: 2 }));
  });

  it('reports too few questions instead of looping or relaxing the rules', () => {
    // Up to 5 with no crossing ten: only a handful of additions exist.
    const res = generateQuestions({ ...base, operation: 'add', maxNumber: 5, count: 20, difficulty: 'none' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('可用題目不足');
  });

  it('explains conflicting settings', () => {
    const cross = generateQuestions({ ...base, operation: 'add', maxNumber: 10, count: 5, difficulty: 'only' });
    expect(cross.ok).toBe(false);
    if (!cross.ok) expect(cross.error).toContain('只找得到 0 道');

    const g1mul = generateQuestions({ ...base, operation: 'multiply' });
    expect(g1mul.ok).toBe(false);
    if (!g1mul.ok) expect(g1mul.error).toContain('小一暫不提供乘法');

    const tooBig = generateQuestions({ ...base, maxNumber: 150 });
    expect(tooBig.ok).toBe(false);
    if (!tooBig.ok) expect(tooBig.error).toContain('最大是 100');
  });

  it('only builds candidates inside the limits', () => {
    const pool = candidates({ ...base, maxNumber: 10, difficulty: 'any' }, 'add');
    expect(pool.every(p => p.left + p.right <= 10)).toBe(true);
    expect(pool.length).toBeGreaterThan(10);
  });
});
