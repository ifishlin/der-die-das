import { useState } from 'react';
import { SYMBOL, type Grade, type Operator, type Question } from '../math/types';
import { validateQuestion } from '../math/validation';
import { newRecord, type QuestionRecord } from '../app/storage';
import { QuestionCard } from './QuestionCard';

/** 自訂一道題：not part of any scored session. */
export function CustomPanel({ grade }: { grade: Grade }) {
  const ops: Operator[] = grade === 1 ? ['add', 'subtract'] : ['add', 'subtract', 'multiply'];
  const [left, setLeft] = useState(grade === 1 ? '8' : '52');
  const [op, setOp] = useState<Operator>(grade === 1 ? 'add' : 'subtract');
  const [right, setRight] = useState(grade === 1 ? '5' : '27');
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [record, setRecord] = useState<QuestionRecord>(newRecord());
  const [childMode, setChildMode] = useState(false);
  const [version, setVersion] = useState(0);

  const build = () => {
    const a = left.trim() === '' ? NaN : Number(left);
    const b = right.trim() === '' ? NaN : Number(right);
    const v = validateQuestion(grade, op, a, b);
    if (!v.ok) {
      setError(v.reason);
      setQuestion(null);
      return;
    }
    setError(null);
    setRecord(newRecord());
    setVersion(n => n + 1);
    setQuestion({ id: `custom-${grade}-${a}-${op}-${b}-${version + 1}`, grade, operator: op, left: a, right: b, tags: ['自訂'] });
  };

  return (
    <section className="panel" aria-labelledby="custom-title">
      <h2 id="custom-title">自訂一道題</h2>
      <p className="muted">輸入一道題，馬上產生這一題的圖解和逐步動畫。自訂題不會算進練習成績。</p>
      <form
        className="custom-form"
        onSubmit={e => {
          e.preventDefault();
          build();
        }}
      >
        <label>
          <span className="visually-hidden">第一個數字</span>
          <input id="custom-left" className="num" type="text" inputMode="numeric" value={left} onChange={e => setLeft(e.target.value.replace(/\D/g, '').slice(0, 4))} aria-label="第一個數字" />
        </label>
        <div className="op-pick" role="radiogroup" aria-label="運算符號">
          {ops.map(o => (
            <button key={o} type="button" role="radio" aria-checked={op === o} className={`op-btn${op === o ? ' on' : ''}`} onClick={() => setOp(o)} aria-label={o === 'add' ? '加' : o === 'subtract' ? '減' : '乘'}>
              {SYMBOL[o]}
            </button>
          ))}
        </div>
        <label>
          <span className="visually-hidden">第二個數字</span>
          <input id="custom-right" className="num" type="text" inputMode="numeric" value={right} onChange={e => setRight(e.target.value.replace(/\D/g, '').slice(0, 4))} aria-label="第二個數字" />
        </label>
        <button type="submit" className="btn primary big">產生圖解</button>
      </form>
      <label className="check">
        <input type="checkbox" checked={childMode} onChange={e => { setChildMode(e.target.checked); setRecord(newRecord()); setVersion(n => n + 1); if (question) setQuestion({ ...question, id: `${question.id}-m` }); }} />
        讓孩子先作答（先把答案和完整解說藏起來）
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {question && <QuestionCard key={question.id} question={question} record={record} onRecord={setRecord} startRevealed={!childMode} />}
    </section>
  );
}
