import { useState } from 'react';
import type { Grade, Question } from '../math/types';
import { generateQuestions, OPERATION_LABEL, operationsFor, type Difficulty, type OperationChoice } from '../math/generator';
import { LIMITS } from '../math/validation';

type Props = {
  grade: Grade;
  onStart: (questions: Question[], title: string) => void;
};

export function GeneratePanel({ grade, onStart }: Props) {
  const ops: OperationChoice[] = grade === 1 ? ['add', 'subtract', 'addsub'] : ['add', 'subtract', 'addsub', 'multiply', 'all'];
  const limit = LIMITS[grade].maxNumber;
  const [operation, setOperation] = useState<OperationChoice>('addsub');
  const [maxNumber, setMaxNumber] = useState<number>(limit);
  const [maxFactor, setMaxFactor] = useState<number>(10);
  const [count, setCount] = useState(20);
  const [difficulty, setDifficulty] = useState<Difficulty>('any');
  const [error, setError] = useState<string | null>(null);

  const chosen = operationsFor(operation);
  const hasAddSub = chosen.some(o => o !== 'multiply');
  const hasMul = chosen.includes('multiply');
  const diffNames: Record<Difficulty, string> =
    grade === 1 ? { none: '不跨十', only: '包含跨十（只出跨十的題）', any: '不限' } : { none: '不進退位', only: '包含進退位（只出要進退位的題）', any: '不限' };

  const submit = () => {
    const res = generateQuestions({ grade, operation, maxNumber, maxFactor, count, difficulty });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    const parts = [OPERATION_LABEL[operation]];
    if (hasAddSub) parts.push(`${maxNumber} 以內`);
    if (hasAddSub && difficulty !== 'any') parts.push(diffNames[difficulty].replace(/（.*）/, ''));
    onStart(res.questions, `新練習：${parts.join('、')}`);
  };

  return (
    <section className="panel" aria-labelledby="gen-title">
      <h2 id="gen-title">產生新題</h2>
      <p className="muted">按下「產生新練習」，會照下面的設定做出一組新的題目。每一題一樣有圖解和動畫。</p>
      <form
        className="form"
        onSubmit={e => {
          e.preventDefault();
          submit();
        }}
      >
        <fieldset>
          <legend>運算</legend>
          <div className="choices">
            {ops.map(o => (
              <label key={o} className={`choice${operation === o ? ' on' : ''}`}>
                <input type="radio" name="op" value={o} checked={operation === o} onChange={() => setOperation(o)} />
                {OPERATION_LABEL[o]}
              </label>
            ))}
          </div>
        </fieldset>

        {hasAddSub && (
          <label className="field">
            <span>加減法的數字上限（最大 {limit}）</span>
            <input id="gen-max" type="number" inputMode="numeric" min={2} max={limit} value={maxNumber} onChange={e => setMaxNumber(Number(e.target.value))} />
          </label>
        )}
        {hasMul && (
          <label className="field">
            <span>乘法的數字上限（最大 10）</span>
            <input id="gen-factor" type="number" inputMode="numeric" min={1} max={10} value={maxFactor} onChange={e => setMaxFactor(Number(e.target.value))} />
          </label>
        )}

        <fieldset>
          <legend>題目數</legend>
          <div className="choices">
            {[5, 10, 20].map(n => (
              <label key={n} className={`choice${count === n ? ' on' : ''}`}>
                <input type="radio" name="count" value={n} checked={count === n} onChange={() => setCount(n)} />
                {n} 題
              </label>
            ))}
          </div>
        </fieldset>

        {hasAddSub && (
          <fieldset>
            <legend>難度{hasMul ? '（乘法不適用）' : ''}</legend>
            <div className="choices">
              {(['none', 'only', 'any'] as Difficulty[]).map(d => (
                <label key={d} className={`choice${difficulty === d ? ' on' : ''}`}>
                  <input type="radio" name="diff" value={d} checked={difficulty === d} onChange={() => setDifficulty(d)} />
                  {diffNames[d]}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <p className="muted small">題目順序：隨機。同一組裡不會出現重複的題目（3 + 4 和 4 + 3 算同一題）。</p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn primary big">
          產生新練習
        </button>
      </form>
    </section>
  );
}
