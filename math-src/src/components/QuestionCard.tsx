import { useMemo, useState } from 'react';
import { answerOf, formatQuestion, SYMBOL, type Question } from '../math/types';
import { generateExplanation, getHints } from '../math/explanations';
import { parseAnswer } from '../math/validation';
import type { QuestionRecord } from '../app/storage';
import { AnimationPlayer } from './AnimationPlayer';
import { AnswerInput } from './AnswerInput';

const PRAISE = ['答對了！', '太棒了！', '好厲害！', '完全正確！'];

type Props = {
  question: Question;
  record: QuestionRecord;
  onRecord: (r: QuestionRecord) => void;
  /** Omit to hide the "下一題" button (custom single question). */
  onNext?: () => void;
  nextLabel?: string;
  /** Show the whole explanation right away (custom question tool). */
  startRevealed?: boolean;
};

export function QuestionCard({ question, record, onRecord, onNext, nextLabel = '下一題', startRevealed = false }: Props) {
  const explanation = useMemo(() => generateExplanation(question), [question]);
  const hints = useMemo(() => getHints(question), [question]);
  const answer = answerOf(question);
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'good' | 'try'; text: string } | null>(
    record.correct ? { tone: 'good', text: '這題已經答對了。' } : null,
  );
  const [playToken, setPlayToken] = useState(0);

  const solved = record.correct === true;
  const revealed = startRevealed || solved || record.sawExplanation;
  const last = explanation.steps.length - 1;
  const maxStep = revealed ? last : record.hintLevel >= 2 ? explanation.hintStep : 0;

  const submit = () => {
    const n = parseAnswer(text);
    if (n === null) {
      setFeedback({ tone: 'try', text: '請輸入一個數字。' });
      return;
    }
    const attempts = record.attempts + 1;
    if (n === answer) {
      onRecord({ ...record, attempts, correct: true, firstTry: attempts === 1 && record.hintLevel === 0 && !record.sawExplanation });
      setFeedback({ tone: 'good', text: `${PRAISE[attempts % PRAISE.length]} ${formatQuestion(question)} = ${answer}` });
      setPlayToken(t => t + 1);
    } else {
      onRecord({ ...record, attempts });
      setFeedback({
        tone: 'try',
        text: attempts === 1 ? `${n} 不對喔，再想想看，可以再試一次！` : `${n} 還不對。按「給我提示」或「看解說」，看圖想一想。`,
      });
      setText('');
    }
  };

  const showHint = () => onRecord({ ...record, hintLevel: record.hintLevel >= 2 ? 2 : ((record.hintLevel + 1) as 1 | 2) });
  const showExplanation = () => {
    onRecord({ ...record, sawExplanation: true });
    setPlayToken(t => t + 1);
  };
  // The session marks an unsolved question as "not correct" when moving on.
  const next = () => {
    setText('');
    setFeedback(null);
    onNext?.();
  };

  return (
    <article className="qcard" aria-labelledby={`eq-${question.id}`}>
      <h2 className="equation" id={`eq-${question.id}`} aria-label={`${question.left} ${spoken(question.operator)} ${question.right} 等於多少`}>
        <span>{question.left}</span>
        <span className="op">{SYMBOL[question.operator]}</span>
        <span>{question.right}</span>
        <span className="op">=</span>
        <span className={solved ? 'ans' : 'ans unknown'}>{solved ? answer : '?'}</span>
      </h2>

      <AnimationPlayer
        explanation={explanation}
        resetKey={question.id}
        maxStep={maxStep}
        playToken={playToken}
        onReachEnd={() => {
          if (!record.sawExplanation && !startRevealed) onRecord({ ...record, sawExplanation: true });
        }}
      />

      {record.hintLevel > 0 && !solved && (
        <div className="hint" role="note">
          <strong>提示 {record.hintLevel}：</strong>
          {hints[record.hintLevel - 1]}
          {record.hintLevel >= 2 && explanation.hintStep > 0 && <span className="hint-more">（圖解可以往下看到第 {explanation.hintStep + 1} 步）</span>}
        </div>
      )}

      {feedback && (
        <p className={`feedback ${feedback.tone}`} role="status">
          {feedback.text}
        </p>
      )}

      <AnswerInput value={text} onChange={setText} onSubmit={submit} disabled={solved} resetKey={question.id} />

      <div className="actions">
        <button type="button" className="btn" onClick={showHint} disabled={solved || record.hintLevel >= 2}>
          💡 給我提示{record.hintLevel === 1 ? '（第 2 個）' : ''}
        </button>
        <button type="button" className="btn" onClick={showExplanation} disabled={revealed}>
          看解說
        </button>
        {onNext && (
          <button type="button" className={`btn ${solved ? 'primary' : ''}`} onClick={next}>
            {nextLabel} →
          </button>
        )}
      </div>
    </article>
  );
}

function spoken(op: Question['operator']) {
  return op === 'add' ? '加' : op === 'subtract' ? '減' : '乘以';
}
