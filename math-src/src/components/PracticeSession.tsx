import type { QuestionRecord, Session } from '../app/storage';
import { GRADE_LABEL } from '../math/types';
import { QuestionCard } from './QuestionCard';
import { ProgressPanel, sessionStats } from './ProgressPanel';

type Props = {
  session: Session;
  onChange: (s: Session) => void;
  onRetryWrong: () => void;
  onRestart: () => void;
  onBack: () => void;
};

export function PracticeSession({ session, onChange, onRetryWrong, onRestart, onBack }: Props) {
  const total = session.questions.length;
  const st = sessionStats(session);

  if (session.finished) {
    return <ProgressPanel session={session} onRetryWrong={onRetryWrong} onRestart={onRestart} onBack={onBack} />;
  }

  const q = session.questions[session.index];
  const setRecord = (r: QuestionRecord) => onChange({ ...session, records: { ...session.records, [q.id]: r } });

  return (
    <section className="practice" aria-label={session.title}>
      <div className="progress-head">
        <span className="where">
          {GRADE_LABEL[session.grade]}・第 {session.index + 1} / {total} 題
        </span>
        <span className="done">答對 {st.correct} 題</span>
      </div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={session.index} aria-label="練習進度">
        <div className="bar-fill" style={{ width: `${(session.index / total) * 100}%` }} />
      </div>
      <QuestionCard
        key={q.id}
        question={q}
        record={session.records[q.id]}
        onRecord={setRecord}
        nextLabel={session.index === total - 1 ? '看結果' : '下一題'}
        onNext={() => {
          const rec = session.records[q.id];
          const records = rec.correct === null ? { ...session.records, [q.id]: { ...rec, correct: false } } : session.records;
          const last = session.index === total - 1;
          onChange({ ...session, records, index: last ? session.index : session.index + 1, finished: last });
        }}
      />
    </section>
  );
}
