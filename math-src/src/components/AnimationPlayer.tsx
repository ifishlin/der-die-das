import { useEffect, useMemo, useRef } from 'react';
import type { Explanation, SceneState } from '../math/scene';
import { prefersReducedMotion, useAnimationSteps } from '../hooks/useAnimationSteps';
import { DotsScene } from '../visuals/DotsScene';
import { BaseTenScene } from '../visuals/BaseTenScene';
import { MultiplicationScene } from '../visuals/MultiplicationScene';
import { PlaceValueScene } from '../visuals/PlaceValueScene';

function SceneView({ scene, first }: { scene: SceneState; first: SceneState }) {
  switch (scene.kind) {
    case 'dots':
      return <DotsScene scene={scene} />;
    case 'blocks':
      return <BaseTenScene scene={scene} hasSecond={first.kind === 'blocks' && first.blocks.some(b => b.place.zone === 'second')} />;
    case 'array':
      return <MultiplicationScene scene={scene} />;
    case 'placevalue':
      return <PlaceValueScene scene={scene} hasSecond={first.kind === 'placevalue' && first.chips.some(c => c.place.zone === 'second')} />;
  }
}

const LEGEND: Record<SceneState['kind'], string> = {
  dots: '1 個圓點 = 1，一個十格框裝滿是 10',
  blocks: '1 條 = 10（十位），1 個小方塊 = 1（個位）',
  array: '每一列是一組，數一數每組有幾個',
  placevalue: '位值表：圓片上寫著它代表多少，100 是一個百、10 是一個十、1 是一個一',
};

type Props = {
  explanation: Explanation;
  /** Changes whenever a different question is shown. */
  resetKey: string;
  /** Furthest step the child may see (before the answer is revealed). */
  maxStep: number;
  /** Increase to start playing from the beginning (e.g. right after a correct answer). */
  playToken?: number;
  onReachEnd?: () => void;
};

export function AnimationPlayer({ explanation, resetKey, maxStep, playToken = 0, onReachEnd }: Props) {
  const steps = explanation.steps;
  const durations = useMemo(() => steps.map(s => s.durationMs ?? 2000), [steps]);
  const c = useAnimationSteps(durations, resetKey, maxStep);
  const last = Math.min(maxStep, steps.length - 1);
  const locked = last < steps.length - 1;
  const current = steps[Math.min(c.index, steps.length - 1)];

  const lastToken = useRef(playToken);
  useEffect(() => {
    if (playToken !== lastToken.current) {
      lastToken.current = playToken;
      if (prefersReducedMotion()) return; // let the child step through manually
      c.replay();
    }
  }, [playToken, c]);

  const reachedEnd = !locked && c.index === steps.length - 1;
  const endRef = useRef(onReachEnd);
  endRef.current = onReachEnd;
  useEffect(() => {
    if (reachedEnd) endRef.current?.();
  }, [reachedEnd, resetKey]);

  return (
    <div className="player">
      <p className="legend">{LEGEND[current.scene.kind]}</p>
      <div className="scene-wrap">
        <SceneView scene={current.scene} first={steps[0].scene} />
      </div>
      <p className="caption" aria-live="polite">
        {current.caption}
      </p>
      <div className="player-controls" role="group" aria-label="動畫控制">
        <span className="step-count">
          步驟 {c.index + 1} / {locked ? '?' : steps.length}
        </span>
        <button type="button" className="btn small" onClick={c.prev} disabled={c.index === 0} aria-label="上一個步驟">
          ◀ 上一步
        </button>
        {c.playing ? (
          <button type="button" className="btn small" onClick={c.pause} aria-label="暫停動畫">
            ❚❚ 暫停
          </button>
        ) : (
          <button type="button" className="btn small" onClick={c.play} disabled={last === 0} aria-label="播放動畫">
            ▶ 播放
          </button>
        )}
        <button type="button" className="btn small" onClick={c.next} disabled={c.index >= last} aria-label="下一個步驟">
          下一步 ▶
        </button>
        <button type="button" className="btn small" onClick={c.replay} disabled={last === 0} aria-label="重播動畫">
          ↺ 重播
        </button>
      </div>
    </div>
  );
}
