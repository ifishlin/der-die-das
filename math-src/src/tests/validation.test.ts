import { describe, expect, it } from 'vitest';
import { parseAnswer, validateQuestion } from '../math/validation';

describe('custom question validation', () => {
  it('accepts the examples from the spec', () => {
    expect(validateQuestion(1, 'add', 8, 5).ok).toBe(true);
    expect(validateQuestion(1, 'subtract', 15, 8).ok).toBe(true);
    expect(validateQuestion(2, 'multiply', 3, 4).ok).toBe(true);
    expect(validateQuestion(2, 'subtract', 100, 58).ok).toBe(true);
  });

  it('rejects them with a clear reason', () => {
    const r1 = validateQuestion(1, 'add', 60, 50);
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.reason).toContain('小一的答案不能超過 100');

    const r2 = validateQuestion(1, 'multiply', 3, 4);
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.reason).toContain('小一暫不提供乘法');

    const r3 = validateQuestion(2, 'subtract', 52, 70);
    expect(r3.ok).toBe(false);
    if (!r3.ok) expect(r3.reason).toContain('負數');
  });

  it('checks ranges and whole numbers', () => {
    expect(validateQuestion(1, 'add', 19, 8).ok).toBe(true);
    expect(validateQuestion(1, 'add', 37, 16).ok).toBe(true);
    expect(validateQuestion(1, 'add', 101, 0).ok).toBe(false);
    expect(validateQuestion(2, 'add', 600, 500).ok).toBe(false);
    expect(validateQuestion(2, 'add', 456, 378).ok).toBe(true);
    expect(validateQuestion(2, 'subtract', 1000, 358).ok).toBe(true);
    expect(validateQuestion(2, 'multiply', 10, 10).ok).toBe(true);
    expect(validateQuestion(2, 'multiply', 11, 2).ok).toBe(false);
    expect(validateQuestion(2, 'multiply', 0, 5).ok).toBe(false);
    expect(validateQuestion(1, 'add', 2.5, 1).ok).toBe(false);
    expect(validateQuestion(1, 'add', Number.NaN, 1).ok).toBe(false);
    expect(validateQuestion(1, 'subtract', 7, 7).ok).toBe(true);
  });

  it('parses only whole-number answers', () => {
    expect(parseAnswer(' 13 ')).toBe(13);
    expect(parseAnswer('0')).toBe(0);
    expect(parseAnswer('-3')).toBeNull();
    expect(parseAnswer('1.5')).toBeNull();
    expect(parseAnswer('')).toBeNull();
  });
});
