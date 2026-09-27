import { useCallback, useEffect, useState } from 'react';
import { GRADE_LABEL, type Grade, type Question, type SessionKind } from '../math/types';
import { presetFor } from '../math/presets';
import { GradeHome } from '../components/GradeHome';
import { PracticeSession } from '../components/PracticeSession';
import { GeneratePanel } from '../components/GeneratePanel';
import { CustomPanel } from '../components/CustomPanel';
import {
  clearGrade,
  loadSession,
  loadSettings,
  newSession,
  saveSession,
  saveSettings,
  storageIsPersistent,
  type GradeSettings,
  type Session,
} from './storage';

type View =
  | { name: 'home' }
  | { name: 'grade'; grade: Grade }
  | { name: 'practice'; grade: Grade; kind: SessionKind }
  | { name: 'generate'; grade: Grade }
  | { name: 'custom'; grade: Grade };

const TITLES: Record<'preset' | 'multiply', string> = { preset: '內建 20 題', multiply: '乘法挑戰' };

function shuffled<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function App() {
  const [view, setView] = useState<View>({ name: 'home' });
  const [session, setSession] = useState<Session | null>(null);
  const [settings, setSettings] = useState<GradeSettings>({ randomOrder: false });
  const [, bump] = useState(0); // re-read saved sessions on the grade page after clearing
  const storageOk = storageIsPersistent();

  const grade = view.name === 'home' ? null : view.grade;
  useEffect(() => {
    if (grade) setSettings(loadSettings(grade));
  }, [grade]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view.name, grade]);

  const update = useCallback((s: Session) => {
    setSession(s);
    saveSession(s);
  }, []);

  const start = (g: Grade, kind: 'preset' | 'multiply', fresh: boolean) => {
    const saved = fresh ? null : loadSession(g, kind);
    const s = saved ?? newSession(g, kind, TITLES[kind], loadSettings(g).randomOrder ? shuffled(presetFor(g, kind)) : presetFor(g, kind));
    update(s);
    setView({ name: 'practice', grade: g, kind });
  };

  const startGenerated = (g: Grade, questions: Question[], title: string) => {
    update(newSession(g, 'generated', title, questions));
    setView({ name: 'practice', grade: g, kind: 'generated' });
  };

  const resume = (g: Grade, kind: SessionKind) => {
    const s = loadSession(g, kind);
    if (!s) return;
    setSession(s);
    setView({ name: 'practice', grade: g, kind });
  };

  return (
    <div className={`app${grade ? ` g${grade}` : ''}`}>
      <header className="top">
        {view.name === 'home' ? (
          <h1 className="brand">數學小練習</h1>
        ) : (
          <>
            <button type="button" className="btn ghost" onClick={() => { setView({ name: 'home' }); setSession(null); }}>
              ← 首頁
            </button>
            {view.name !== 'grade' && (
              <button type="button" className="btn ghost" onClick={() => setView({ name: 'grade', grade: view.grade })}>
                ← {GRADE_LABEL[view.grade]}選單
              </button>
            )}
            <span className={`grade-tag g${view.grade}`}>{GRADE_LABEL[view.grade]}數學</span>
          </>
        )}
      </header>

      <main className="main">
        {view.name === 'home' && <Home onGo={setView} onStart={start} />}

        {view.name === 'grade' && (
          <GradeHome
            grade={view.grade}
            sessions={{
              preset: loadSession(view.grade, 'preset'),
              multiply: view.grade === 2 ? loadSession(2, 'multiply') : null,
              generated: loadSession(view.grade, 'generated'),
            }}
            settings={settings}
            onSettings={s => {
              setSettings(s);
              saveSettings(view.grade, s);
            }}
            onStart={(kind, fresh) => start(view.grade, kind, fresh)}
            onResumeGenerated={() => resume(view.grade, 'generated')}
            onGenerate={() => setView({ name: 'generate', grade: view.grade })}
            onCustom={() => setView({ name: 'custom', grade: view.grade })}
            onClear={() => {
              clearGrade(view.grade);
              setSettings(loadSettings(view.grade));
              bump(n => n + 1);
            }}
            storageOk={storageOk}
          />
        )}

        {view.name === 'practice' && session && session.grade === view.grade && (
          <PracticeSession
            session={session}
            onChange={update}
            onBack={() => setView({ name: 'grade', grade: view.grade })}
            onRestart={() => {
              if (session.kind === 'generated') update(newSession(session.grade, 'generated', session.title, session.questions));
              else start(view.grade, session.kind, true);
            }}
            onRetryWrong={() => {
              const wrong = session.questions.filter(q => session.records[q.id]?.correct !== true);
              update(newSession(session.grade, session.kind, `${session.title}（錯題重練）`, wrong));
            }}
          />
        )}

        {view.name === 'generate' && <GeneratePanel grade={view.grade} onStart={(qs, title) => startGenerated(view.grade, qs, title)} />}
        {view.name === 'custom' && <CustomPanel grade={view.grade} />}
      </main>

      <footer className="foot">
        <p>進度只存在這台裝置的瀏覽器裡，不需要登入，也不會上傳。</p>
      </footer>
    </div>
  );
}

function Home({ onGo, onStart }: { onGo: (v: View) => void; onStart: (g: Grade, kind: 'preset' | 'multiply', fresh: boolean) => void }) {
  const resumeOr = (g: Grade, kind: 'preset' | 'multiply') => {
    const s = loadSession(g, kind);
    onStart(g, kind, !(s && !s.finished));
  };
  return (
    <section className="home" aria-label="選擇年級">
      <p className="home-lede">選一個年級開始。每一題都有圖解和動畫，可以一步一步看。</p>
      <div className="grade-cards">
        <article className="grade-card g1">
          <span className="grade-big">小一</span>
          <h2>小一數學：100 以內加減法</h2>
          <p>20 以內用小圓點和十格框學湊十、跨十；更大的數用十位積木。</p>
          <div className="card-actions">
            <button type="button" className="btn primary big" onClick={() => resumeOr(1, 'preset')}>開始 20 題</button>
            <button type="button" className="btn" onClick={() => onGo({ name: 'generate', grade: 1 })}>產生新題</button>
            <button type="button" className="btn" onClick={() => onGo({ name: 'custom', grade: 1 })}>自訂一道題</button>
            <button type="button" className="btn link" onClick={() => onGo({ name: 'grade', grade: 1 })}>小一選單與進度</button>
          </div>
        </article>
        <article className="grade-card g2">
          <span className="grade-big">小二</span>
          <h2>小二數學：100 以內加減法、基礎乘法</h2>
          <p>用十位積木看進位、退位，用點陣學乘法。</p>
          <div className="card-actions">
            <button type="button" className="btn primary big" onClick={() => resumeOr(2, 'preset')}>開始 20 題</button>
            <button type="button" className="btn" onClick={() => resumeOr(2, 'multiply')}>乘法挑戰</button>
            <button type="button" className="btn" onClick={() => onGo({ name: 'generate', grade: 2 })}>產生新題</button>
            <button type="button" className="btn" onClick={() => onGo({ name: 'custom', grade: 2 })}>自訂一道題</button>
            <button type="button" className="btn link" onClick={() => onGo({ name: 'grade', grade: 2 })}>小二選單與進度</button>
          </div>
        </article>
      </div>
    </section>
  );
}
