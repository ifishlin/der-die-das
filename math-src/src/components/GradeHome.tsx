import { useState } from 'react';
import type { Grade, SessionKind } from '../math/types';
import type { GradeSettings, Session } from '../app/storage';
import { sessionStats } from './ProgressPanel';

type Props = {
  grade: Grade;
  sessions: Partial<Record<SessionKind, Session | null>>;
  settings: GradeSettings;
  onSettings: (s: GradeSettings) => void;
  onStart: (kind: 'preset' | 'multiply', fresh: boolean) => void;
  onResumeGenerated: () => void;
  onGenerate: () => void;
  onCustom: () => void;
  onClear: () => void;
  storageOk: boolean;
};

function Resume({ s }: { s: Session | null | undefined }) {
  if (!s) return null;
  const st = sessionStats(s);
  return (
    <span className="resume">
      {s.finished ? `上次完成：答對 ${st.correct} / ${st.total} 題` : `上次做到第 ${s.index + 1} / ${st.total} 題`}
    </span>
  );
}

export function GradeHome(p: Props) {
  const [confirm, setConfirm] = useState(false);
  const preset = p.sessions.preset;
  const mul = p.sessions.multiply;
  const gen = p.sessions.generated;
  const title = p.grade === 1 ? '20 以內加減法' : '100 以內加減法、基礎乘法';

  return (
    <section className="grade-home" aria-labelledby="gh-title">
      <h2 id="gh-title">{title}</h2>
      {!p.storageOk && <p className="notice">這個瀏覽器不能儲存資料，重新整理後進度會不見，但還是可以正常練習。</p>}

      <div className="menu">
        <div className="menu-item">
          <div>
            <h3>內建 20 題</h3>
            <p>{p.grade === 1 ? '從 10 以內、湊十，一路到跨 10 的加減法。' : '不進位、進位、不退位、退位的加減法。'}</p>
            <Resume s={preset} />
          </div>
          <div className="menu-actions">
            {preset && !preset.finished ? (
              <>
                <button type="button" className="btn primary" onClick={() => p.onStart('preset', false)}>繼續練習</button>
                <button type="button" className="btn" onClick={() => p.onStart('preset', true)}>重新開始</button>
              </>
            ) : (
              <button type="button" className="btn primary" onClick={() => p.onStart('preset', true)}>開始 20 題</button>
            )}
            <label className="check">
              <input type="checkbox" checked={p.settings.randomOrder} onChange={e => p.onSettings({ ...p.settings, randomOrder: e.target.checked })} />
              隨機順序（下次開始時生效）
            </label>
          </div>
        </div>

        {p.grade === 2 && (
          <div className="menu-item">
            <div>
              <h3>乘法挑戰</h3>
              <p>10 題基礎乘法，用「幾組、每組幾個」的點陣來看。和上面的 20 題分開計算。</p>
              <Resume s={mul} />
            </div>
            <div className="menu-actions">
              {mul && !mul.finished ? (
                <>
                  <button type="button" className="btn primary" onClick={() => p.onStart('multiply', false)}>繼續乘法挑戰</button>
                  <button type="button" className="btn" onClick={() => p.onStart('multiply', true)}>重新開始</button>
                </>
              ) : (
                <button type="button" className="btn primary" onClick={() => p.onStart('multiply', true)}>開始乘法挑戰</button>
              )}
            </div>
          </div>
        )}

        <div className="menu-item">
          <div>
            <h3>產生新題</h3>
            <p>家長設定運算、數字上限和難度，產生一組新的練習。</p>
            <Resume s={gen} />
          </div>
          <div className="menu-actions">
            <button type="button" className="btn primary" onClick={p.onGenerate}>設定新練習</button>
            {gen && !gen.finished && <button type="button" className="btn" onClick={p.onResumeGenerated}>繼續上次的新練習</button>}
          </div>
        </div>

        <div className="menu-item">
          <div>
            <h3>自訂一道題</h3>
            <p>輸入任何一道題，例如 {p.grade === 1 ? '8 + 5' : '52 − 27'}，馬上看圖解和動畫。</p>
          </div>
          <div className="menu-actions">
            <button type="button" className="btn primary" onClick={p.onCustom}>自訂一道題</button>
          </div>
        </div>
      </div>

      <div className="danger">
        {confirm ? (
          <>
            <span>確定要清除{p.grade === 1 ? '小一' : '小二'}的所有進度嗎？另一個年級不受影響。</span>
            <button type="button" className="btn warn" onClick={() => { p.onClear(); setConfirm(false); }}>確定清除</button>
            <button type="button" className="btn" onClick={() => setConfirm(false)}>取消</button>
          </>
        ) : (
          <button type="button" className="btn link" onClick={() => setConfirm(true)}>清除{p.grade === 1 ? '小一' : '小二'}進度</button>
        )}
      </div>
    </section>
  );
}
