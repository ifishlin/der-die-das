import { answerOf, type Grade, type Operator } from './types';

export const LIMITS = {
  1: { maxNumber: 100 },
  2: { maxNumber: 100, maxFactor: 10 },
} as const;

export type ValidationResult = { ok: true } | { ok: false; reason: string };

const isWhole = (n: number) => Number.isInteger(n) && n >= 0;

/** Checks one question against the rules of a grade. The reason is written for a parent or child. */
export function validateQuestion(grade: Grade, operator: Operator, left: number, right: number): ValidationResult {
  if (!Number.isFinite(left) || !Number.isFinite(right)) return { ok: false, reason: '請輸入兩個數字。' };
  if (!isWhole(left) || !isWhole(right)) return { ok: false, reason: '請輸入 0 或正整數（不用小數，也不用負數）。' };

  if (grade === 1) {
    if (operator === 'multiply') return { ok: false, reason: '小一暫不提供乘法，乘法在小二的「乘法挑戰」。' };
    const max = LIMITS[1].maxNumber;
    if (left > max || right > max) return { ok: false, reason: `小一的數字不能超過 ${max}。` };
    if (operator === 'subtract' && right > left) return { ok: false, reason: '目前不練習負數：減號後面的數字不能比前面大。' };
    if (answerOf({ operator, left, right }) > max) return { ok: false, reason: `小一的答案不能超過 ${max}。` };
    return { ok: true };
  }

  if (operator === 'multiply') {
    const f = LIMITS[2].maxFactor;
    if (left < 1 || right < 1 || left > f || right > f) return { ok: false, reason: `乘法的兩個數字都要在 1 到 ${f} 之間。` };
    if (left * right > LIMITS[2].maxNumber) return { ok: false, reason: '乘法的答案不能超過 100。' };
    return { ok: true };
  }
  const max = LIMITS[2].maxNumber;
  if (left > max || right > max) return { ok: false, reason: `小二加減法的數字不能超過 ${max}。` };
  if (operator === 'subtract' && right > left) return { ok: false, reason: '目前不練習負數：減號後面的數字不能比前面大。' };
  if (answerOf({ operator, left, right }) > max) return { ok: false, reason: `小二加減法的答案不能超過 ${max}。` };
  return { ok: true };
}

/** Parses a child's typed answer. Only whole non-negative numbers count as an answer. */
export function parseAnswer(text: string): number | null {
  const t = text.trim();
  if (!/^\d{1,4}$/.test(t)) return null;
  return Number(t);
}
