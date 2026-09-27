import { beforeEach, describe, expect, it } from 'vitest';
import { clearGrade, loadSession, newSession, saveSession, sessionKey } from '../app/storage';
import { GRADE1_PRESET, GRADE2_MULTIPLY, GRADE2_PRESET } from '../math/presets';

describe('per-grade progress', () => {
  beforeEach(() => window.localStorage.clear());

  it('uses different keys for each grade and practice set', () => {
    const keys = [sessionKey(1, 'preset'), sessionKey(2, 'preset'), sessionKey(2, 'multiply'), sessionKey(1, 'generated')];
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('saving one grade does not overwrite the other', () => {
    const g1 = { ...newSession(1, 'preset', 'a', GRADE1_PRESET), index: 5 };
    const g2 = { ...newSession(2, 'preset', 'b', GRADE2_PRESET), index: 9 };
    const mul = { ...newSession(2, 'multiply', 'c', GRADE2_MULTIPLY), index: 2 };
    saveSession(g1);
    saveSession(g2);
    saveSession(mul);
    expect(loadSession(1, 'preset')?.index).toBe(5);
    expect(loadSession(2, 'preset')?.index).toBe(9);
    expect(loadSession(2, 'multiply')?.index).toBe(2);
  });

  it('clearing grade 1 keeps grade 2', () => {
    saveSession(newSession(1, 'preset', 'a', GRADE1_PRESET));
    saveSession(newSession(2, 'preset', 'b', GRADE2_PRESET));
    clearGrade(1);
    expect(loadSession(1, 'preset')).toBeNull();
    expect(loadSession(2, 'preset')).not.toBeNull();
  });
});
