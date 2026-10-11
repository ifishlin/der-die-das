import type { Dot, DotsScene as Scene } from '../math/scene';
import { TenFrame } from './TenFrame';

const CELL = 40;
const TOP = 40;
const LEFT = 14;
const FRAME_GAP = 26;
export const SIDE_X = LEFT + 5 * CELL + 34;
export const DOTS_WIDTH = SIDE_X + 5 * CELL + 14;
export const DOTS_HEIGHT = TOP + 4 * CELL + FRAME_GAP + 14;

function frameXY(slot: number) {
  const frame = slot < 10 ? 0 : 1;
  const i = slot % 10;
  return { x: LEFT + (i % 5) * CELL, y: TOP + frame * (2 * CELL + FRAME_GAP) + Math.floor(i / 5) * CELL };
}

function sideXY(slot: number) {
  return { x: SIDE_X + (slot % 5) * CELL, y: TOP + Math.floor(slot / 5) * CELL };
}

/** Dots that were taken away, in the order they leave (highest slot first, like in the explanation). */
function takenAway(dots: Dot[]) {
  return dots.filter(d => d.removed).sort((x, y) => y.place.slot - x.place.slot);
}

/**
 * 小一加減法：1 個圓點 = 1。左邊兩個十格框（0–20）。
 * 加法：右邊是還沒加進來的點。減法（hasAway）：右邊是「拿走的」區，被拿走的點一個一個滑過去。
 */
export function DotsScene({ scene, hasAway = false }: { scene: Scene; hasAway?: boolean }) {
  const away = takenAway(scene.dots);
  const inFrame = scene.dots.filter(d => d.place.area === 'frame' && !d.removed).length;
  const waiting = scene.dots.filter(d => d.place.area === 'side').length;
  return (
    <svg
      viewBox={`0 0 ${DOTS_WIDTH} ${DOTS_HEIGHT}`}
      className="scene"
      role="img"
      aria-label={`圖解：十格框裡有 ${inFrame} 個點${waiting ? `，旁邊還有 ${waiting} 個` : ''}${away.length ? `，右邊拿走了 ${away.length} 個` : ''}`}
    >
      <text x={LEFT} y={24} className="scene-label">{scene.frameLabel}</text>
      {scene.sideLabel && waiting > 0 && <text x={SIDE_X} y={24} className="scene-label">{scene.sideLabel}</text>}
      {hasAway && (
        <>
          <rect x={SIDE_X - 6} y={TOP - 6} width={5 * CELL + 12} height={4 * CELL + 12} rx={12} className="away-box" />
          <text x={SIDE_X} y={24} className="scene-label">{away.length ? `拿走的：${away.length} 個` : '拿走的'}</text>
        </>
      )}
      <TenFrame x={LEFT} y={TOP} cell={CELL} />
      <TenFrame x={LEFT} y={TOP + 2 * CELL + FRAME_GAP} cell={CELL} />
      {scene.dots.map(d => {
        const k = d.removed ? away.indexOf(d) : -1;
        const { x, y } = k >= 0 ? sideXY(k) : d.place.area === 'frame' ? frameXY(d.place.slot) : sideXY(d.place.slot);
        return (
          <g
            key={d.id}
            className={`mv dot dot-${d.color}${d.removed ? ' removed' : ''}`}
            // leave one after another, so you can watch each dot move
            style={{ transform: `translate(${x}px, ${y}px)`, transitionDelay: k >= 0 ? `${Math.min(k * 70, 560)}ms` : '0ms' }}
          >
            <circle cx={CELL / 2} cy={CELL / 2} r={CELL / 2 - 6} />
          </g>
        );
      })}
    </svg>
  );
}
