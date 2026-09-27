import { describe, expect, it } from 'vitest';
import { GRADE1_PRESET, GRADE2_MULTIPLY, GRADE2_PRESET } from '../math/presets';
import { answerOf } from '../math/types';
import { validateQuestion } from '../math/validation';

describe('built-in question sets', () => {
  it('has exactly 20 grade-1, 20 grade-2 and at least 10 multiplication questions', () => {
    expect(GRADE1_PRESET).toHaveLength(20);
    expect(GRADE2_PRESET).toHaveLength(20);
    expect(GRADE2_MULTIPLY.length).toBeGreaterThanOrEqual(10);
  });

  it('keeps the order and values from the spec', () => {
    expect(GRADE1_PRESET.map(q => `${q.left}${q.operator[0]}${q.right}`).slice(-4)).toEqual(['8a5', '9a7', '13s6', '15s8']);
    expect(GRADE2_PRESET[14]).toMatchObject({ left: 100, right: 58, operator: 'subtract' });
    expect(GRADE2_MULTIPLY.map(q => `${q.left}x${q.right}`)).toEqual(['2x4', '3x4', '5x6', '2x9', '4x7', '6x6', '7x3', '8x5', '9x4', '10x8']);
  });

  it('only contains valid questions for its grade, with no negative answers', () => {
    for (const q of [...GRADE1_PRESET, ...GRADE2_PRESET, ...GRADE2_MULTIPLY]) {
      expect(validateQuestion(q.grade, q.operator, q.left, q.right)).toEqual({ ok: true });
      expect(answerOf(q)).toBeGreaterThanOrEqual(0);
    }
    for (const q of GRADE1_PRESET) expect(answerOf(q)).toBeLessThanOrEqual(20);
    for (const q of GRADE2_PRESET) expect(answerOf(q)).toBeLessThanOrEqual(100);
  });

  it('grade 1 has no multiplication; the multiplication set is grade 2 only', () => {
    expect(GRADE1_PRESET.some(q => q.operator === 'multiply')).toBe(false);
    expect(GRADE2_PRESET.some(q => q.operator === 'multiply')).toBe(false);
    expect(GRADE2_MULTIPLY.every(q => q.grade === 2 && q.operator === 'multiply')).toBe(true);
  });

  it('uses stable, unique ids', () => {
    const ids = [...GRADE1_PRESET, ...GRADE2_PRESET, ...GRADE2_MULTIPLY].map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(GRADE1_PRESET[0].id).toBe('g1-01');
  });
});
