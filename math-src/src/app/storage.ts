import type { Grade, Question, SessionKind } from '../math/types';

export type QuestionRecord = {
  attempts: number;
  /** true once answered correctly; false if the child moved on without getting it. */
  correct: boolean | null;
  firstTry: boolean;
  sawExplanation: boolean;
  hintLevel: 0 | 1 | 2;
};

export type Session = {
  grade: Grade;
  kind: SessionKind;
  title: string;
  questions: Question[];
  index: number;
  records: Record<string, QuestionRecord>;
  finished: boolean;
};

export type GradeSettings = {
  randomOrder: boolean;
};

const PREFIX = 'mathpractice:v1';

export const sessionKey = (grade: Grade, kind: SessionKind) => `${PREFIX}:g${grade}:session:${kind}`;
export const settingsKey = (grade: Grade) => `${PREFIX}:g${grade}:settings`;
const gradePrefix = (grade: Grade) => `${PREFIX}:g${grade}:`;

/** In-memory stand-in used when localStorage is blocked (private mode, disabled site data). */
const memory = new Map<string, string>();
let persistent: boolean | null = null;

export function storageIsPersistent(): boolean {
  if (persistent === null) {
    try {
      const k = `${PREFIX}:probe`;
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      persistent = true;
    } catch {
      persistent = false;
    }
  }
  return persistent;
}

function read(key: string): string | null {
  if (storageIsPersistent()) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      /* fall through to memory */
    }
  }
  return memory.get(key) ?? null;
}

function write(key: string, value: string | null) {
  if (storageIsPersistent()) {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
      return;
    } catch {
      /* fall through to memory */
    }
  }
  if (value === null) memory.delete(key);
  else memory.set(key, value);
}

export function loadSession(grade: Grade, kind: SessionKind): Session | null {
  const raw = read(sessionKey(grade, kind));
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Session;
    return s.grade === grade && Array.isArray(s.questions) ? s : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  write(sessionKey(session.grade, session.kind), JSON.stringify(session));
}

export function loadSettings(grade: Grade): GradeSettings {
  try {
    const raw = read(settingsKey(grade));
    if (raw) return { randomOrder: false, ...JSON.parse(raw) };
  } catch {
    /* ignore broken data */
  }
  return { randomOrder: false };
}

export function saveSettings(grade: Grade, settings: GradeSettings) {
  write(settingsKey(grade), JSON.stringify(settings));
}

/** Removes every saved session and setting of one grade; the other grade is untouched. */
export function clearGrade(grade: Grade) {
  const p = gradePrefix(grade);
  if (storageIsPersistent()) {
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(p)) keys.push(k);
      }
      keys.forEach(k => window.localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
  }
  [...memory.keys()].filter(k => k.startsWith(p)).forEach(k => memory.delete(k));
}

export function newRecord(): QuestionRecord {
  return { attempts: 0, correct: null, firstTry: false, sawExplanation: false, hintLevel: 0 };
}

export function newSession(grade: Grade, kind: SessionKind, title: string, questions: Question[]): Session {
  return {
    grade,
    kind,
    title,
    questions,
    index: 0,
    records: Object.fromEntries(questions.map(q => [q.id, newRecord()])),
    finished: false,
  };
}
