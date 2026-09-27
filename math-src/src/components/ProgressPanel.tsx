import type { Session } from '../app/storage';
import { formatQuestion } from '../math/types';

export function sessionStats(s: Session) {
  const recs = s.questions.map(q => s.records[q.id]);
  const correct = recs.filter(r => r?.correct === true).length;
  const firstTry = recs.filter(r => r?.firstTry).length;
  const answered = recs.filter(r => r && r.correct !== null).length;
  const wrong = s.questions.filter(q => s.records[q.id]?.correct !== true);
  return { total: s.questions.length, correct, firstTry, answered, wrong };
}

type Props = {
  session: Session;
  onRetryWrong: () => void;
  onRestart: () => void;
  onBack: () => void;
};

/** End-of-session summary. Only encouraging wording; no scores against other children. */
export function ProgressPanel({ session, onRetryWrong, onRestart, onBack }: Props) {
  const st = sessionStats(session);
  const allDone = st.wrong.length === 0;
  return (
    <section className="summary" aria-labelledby="summary-title">
      <h2 id="summary-title">{allDone ? '全部完成了，好棒！' : '這一輪完成了！'}</h2>
      <div className="stats">
        <div className="stat good">
          <b>{st.correct}</b>
          <span>題答對</span>
        </div>
        <div className="stat">
          <b>{st.firstTry}</b>
          <span>題第一次就答對</span>
        </div>
        <div className="stat soft">
          <b>{st.wrong.length}</b>
          <span>題可以再練習</span>
        </div>
      </div>
      {st.wrong.length > 0 && (
        <p className="again-list">
          再練習一下：{st.wrong.map(q => formatQuestion(q)).join('、')}
        </p>
      )}
      <div className="actions">
        {st.wrong.length > 0 && (
          <button type="button" className="btn primary" onClick={onRetryWrong}>
            只重練這 {st.wrong.length} 題
          </button>
        )}
        <button type="button" className="btn" onClick={onRestart}>
          整輪再做一次
        </button>
        <button type="button" className="btn" onClick={onBack}>
          回到{session.grade === 1 ? '小一' : '小二'}首頁
        </button>
      </div>
    </section>
  );
}
