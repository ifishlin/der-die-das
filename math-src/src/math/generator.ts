import { isRegrouping, type Grade, type Operator, type Question } from './types';
import { LIMITS, validateQuestion } from './validation';

export type OperationChoice = 'add' | 'subtract' | 'addsub' | 'multiply' | 'all';
/** none = 不跨十／不進退位, only = 只出跨十／進退位的題目, any = 不限 */
export type Difficulty = 'none' | 'only' | 'any';

export type GeneratorOptions = {
  grade: Grade;
  operation: OperationChoice;
  /** Upper limit for addition / subtraction numbers (answer and operands). */
  maxNumber: number;
  /** Upper limit for each multiplication factor (grade 2 only). */
  maxFactor?: number;
  count: number;
  difficulty: Difficulty;
};

export type GeneratorResult = { ok: true; questions: Question[] } | { ok: false; error: string };

export const OPERATION_LABEL: Record<OperationChoice, string> = {
  add: '加法',
  subtract: '減法',
  addsub: '加減混合',
  multiply: '乘法',
  all: '加減乘混合',
};

export function operationsFor(choice: OperationChoice): Operator[] {
  switch (choice) {
    case 'add':
      return ['add'];
    case 'subtract':
      return ['subtract'];
    case 'addsub':
      return ['add', 'subtract'];
    case 'multiply':
      return ['multiply'];
    case 'all':
      return ['add', 'subtract', 'multiply'];
  }
}

type Pair = { operator: Operator; left: number; right: number };

/** 3 + 4 and 4 + 3 count as the same question; 7 − 3 and 3 − 7 never both exist. */
export function pairKey(p: Pair): string {
  if (p.operator === 'subtract') return `s:${p.left}:${p.right}`;
  const [a, b] = p.left <= p.right ? [p.left, p.right] : [p.right, p.left];
  return `${p.operator[0]}:${a}:${b}`;
}

function regroups(grade: Grade, p: Pair): boolean {
  return isRegrouping({ grade, ...p });
}

/** Every allowed question for one operator, as one representative per pairKey. */
export function candidates(opts: GeneratorOptions, operator: Operator): Pair[] {
  const out = new Map<string, Pair>();
  const add = (p: Pair) => {
    if (!validateQuestion(opts.grade, p.operator, p.left, p.right).ok) return;
    if (p.operator !== 'multiply') {
      if (opts.difficulty === 'none' && regroups(opts.grade, p)) return;
      if (opts.difficulty === 'only' && !regroups(opts.grade, p)) return;
    }
    const k = pairKey(p);
    if (!out.has(k)) out.set(k, p);
  };
  if (operator === 'multiply') {
    const f = opts.maxFactor ?? LIMITS[2].maxFactor;
    for (let a = 1; a <= f; a++) for (let b = 1; b <= f; b++) if (a * b <= LIMITS[2].maxNumber) add({ operator, left: a, right: b });
    return [...out.values()];
  }
  const max = opts.maxNumber;
  // Operands start at 1: "5 + 0" style questions are not useful as generated practice.
  for (let a = 1; a <= max; a++) {
    for (let b = 1; b <= max; b++) {
      if (operator === 'add' && a + b <= max) add({ operator, left: a, right: b });
      if (operator === 'subtract' && b <= a) add({ operator, left: a, right: b });
    }
  }
  return [...out.values()];
}

export type Random = () => number;

function shuffle<T>(items: T[], random: Random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Checks the form values before generating, so conflicting settings get a clear message. */
export function checkOptions(opts: GeneratorOptions): string | null {
  const ops = operationsFor(opts.operation);
  if (opts.grade === 1 && ops.includes('multiply')) return '小一暫不提供乘法。';
  if (![5, 10, 20].includes(opts.count)) return '題目數請選 5、10 或 20 題。';
  const limit = LIMITS[opts.grade].maxNumber;
  if (ops.some(o => o !== 'multiply')) {
    if (!Number.isInteger(opts.maxNumber) || opts.maxNumber < 2) return '數字上限至少要是 2。';
    if (opts.maxNumber > limit) return `${opts.grade === 1 ? '小一' : '小二'}的數字上限最大是 ${limit}。`;
  }
  if (ops.includes('multiply')) {
    const f = opts.maxFactor ?? LIMITS[2].maxFactor;
    if (!Number.isInteger(f) || f < 1 || f > LIMITS[2].maxFactor) return `乘法的數字上限要在 1 到 ${LIMITS[2].maxFactor} 之間。`;
  }
  return null;
}

/**
 * Builds a new practice set. Operators are spread as evenly as possible; if a pool is too
 * small for its share the result is an error that says so, never a silently relaxed rule.
 */
export function generateQuestions(opts: GeneratorOptions, random: Random = Math.random): GeneratorResult {
  const problem = checkOptions(opts);
  if (problem) return { ok: false, error: problem };

  const ops = operationsFor(opts.operation);
  const shares = ops.map((_, i) => Math.floor(opts.count / ops.length) + (i < opts.count % ops.length ? 1 : 0));
  const picked: Pair[] = [];
  for (let i = 0; i < ops.length; i++) {
    const pool = candidates(opts, ops[i]);
    if (pool.length < shares[i]) {
      const cond = ops[i] === 'multiply' ? '' : opts.difficulty === 'none' ? (opts.grade === 1 ? '、不跨十' : '、不進退位') : opts.difficulty === 'only' ? (opts.grade === 1 ? '、要跨十' : '、要進退位') : '';
      return {
        ok: false,
        error: `可用題目不足：在目前的設定下（${OPERATION_NAME[ops[i]]}${cond}），只找得到 ${pool.length} 道不重複的題目，需要 ${shares[i]} 道。請放寬條件、提高數字上限，或減少題數。`,
      };
    }
    // For + and ×, randomly show either order (3 + 4 or 4 + 3).
    for (const p of shuffle(pool, random).slice(0, shares[i])) {
      const swap = p.operator !== 'subtract' && random() < 0.5;
      picked.push(swap ? { ...p, left: p.right, right: p.left } : p);
    }
  }

  // Keys are unique within a set, so 3 + 4 and 4 + 3 never both appear.
  const order = shuffle(picked, random);
  const stamp = Math.floor(random() * 1e6).toString(36);
  const questions: Question[] = order.map((p, i) => ({
    id: `gen-${opts.grade}-${stamp}-${i + 1}`,
    grade: opts.grade,
    operator: p.operator,
    left: p.left,
    right: p.right,
    tags: [p.operator === 'multiply' ? '乘法' : regroups(opts.grade, p) ? (opts.grade === 1 ? '跨 10' : '進退位') : opts.grade === 1 ? '不跨 10' : '不進退位'],
  }));
  return { ok: true, questions };
}

const OPERATION_NAME: Record<Operator, string> = { add: '加法', subtract: '減法', multiply: '乘法' };
