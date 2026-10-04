export type Grade = 1 | 2;
export type Operator = 'add' | 'subtract' | 'multiply';

export type Question = {
  id: string;
  grade: Grade;
  operator: Operator;
  left: number;
  right: number;
  tags: string[];
};

/** Which practice set a session belongs to. Each kind keeps its own progress. */
export type SessionKind = 'preset' | 'multiply' | 'thousand' | 'generated';
/** Built-in question sets (everything except parent-generated sessions). */
export type PresetKind = 'preset' | 'multiply' | 'thousand';

export const SYMBOL: Record<Operator, string> = { add: '+', subtract: '−', multiply: '×' };
export const OPERATOR_NAME: Record<Operator, string> = { add: '加法', subtract: '減法', multiply: '乘法' };

/** The answer is always computed, never stored by hand. */
export function answerOf(q: Pick<Question, 'operator' | 'left' | 'right'>): number {
  switch (q.operator) {
    case 'add':
      return q.left + q.right;
    case 'subtract':
      return q.left - q.right;
    case 'multiply':
      return q.left * q.right;
  }
}

export function formatQuestion(q: Pick<Question, 'operator' | 'left' | 'right'>): string {
  return `${q.left} ${SYMBOL[q.operator]} ${q.right}`;
}

/** Grade 1: the ones digits add past ten (8 + 5), or a subtraction has to go below ten (13 − 6). */
export function crossesTen(q: Pick<Question, 'operator' | 'left' | 'right'>): boolean {
  if (q.operator === 'add') return (q.left % 10) + (q.right % 10) > 10;
  if (q.operator === 'subtract') return q.left > 10 && q.left % 10 < q.right % 10;
  return false;
}

/** Grade 2: addition needs a carry, or subtraction needs a borrow, in the ones or tens place. */
export function needsRegrouping(q: Pick<Question, 'operator' | 'left' | 'right'>): boolean {
  const o = (n: number) => n % 10;
  const t = (n: number) => Math.floor(n / 10) % 10;
  if (q.operator === 'add') {
    const carry = o(q.left) + o(q.right) >= 10 ? 1 : 0;
    return carry === 1 || t(q.left) + t(q.right) + carry >= 10;
  }
  if (q.operator === 'subtract') {
    const borrow = o(q.left) < o(q.right) ? 1 : 0;
    return borrow === 1 || t(q.left) - borrow < t(q.right);
  }
  return false;
}

/** Numbers above 100 are shown on a place-value chart (百／十／個) instead of base-ten blocks. */
export function usesPlaceValue(q: Pick<Question, 'operator' | 'left' | 'right'>): boolean {
  return q.operator !== 'multiply' && Math.max(q.left, q.right, answerOf(q)) > 100;
}

/**
 * Grade 1 pictures use dots in two ten-frames, which only hold 20. Bigger grade-1 questions
 * (allowed up to 100) switch to base-ten blocks, like grade 2.
 */
export function usesTenFrames(q: Pick<Question, 'grade' | 'operator' | 'left' | 'right'>): boolean {
  return q.grade === 1 && q.operator !== 'multiply' && Math.max(q.left, q.right, answerOf(q)) <= 20;
}

/** "Hard" question for the difficulty filter: crossing ten on ten-frames, carry/borrow on blocks. */
export function isRegrouping(q: Pick<Question, 'grade' | 'operator' | 'left' | 'right'>): boolean {
  return usesTenFrames(q) ? crossesTen(q) : needsRegrouping(q);
}

export const GRADE_LABEL: Record<Grade, string> = { 1: '小一', 2: '小二' };
