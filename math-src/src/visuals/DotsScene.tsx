import type { DotsScene as Scene } from '../math/scene';
import { TenFrame } from './TenFrame';

const CELL = 40;
const TOP = 40;
const LEFT = 14;
const FRAME_GAP = 26;
const SIDE_X = LEFT + 5 * CELL + 34;
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

/** 小一加減法：1 個圓點 = 1。左邊兩個十格框（0–20），右邊是還沒加進來的點。 */
export function DotsScene({ scene }: { scene: Scene }) {
  const inFrame = scene.dots.filter(d => d.place.area === 'frame' && !d.removed).length;
  const waiting = scene.dots.filter(d => d.place.area === 'side').length;
  return (
    <svg viewBox={`0 0 ${DOTS_WIDTH} ${DOTS_HEIGHT}`} className="scene" role="img" aria-label={`圖解：十格框裡有 ${inFrame} 個點${waiting ? `，旁邊還有 ${waiting} 個` : ''}`}>
      <text x={LEFT} y={24} className="scene-label">{scene.frameLabel}</text>
      {scene.sideLabel && waiting > 0 && <text x={SIDE_X} y={24} className="scene-label">{scene.sideLabel}</text>}
      <TenFrame x={LEFT} y={TOP} cell={CELL} />
      <TenFrame x={LEFT} y={TOP + 2 * CELL + FRAME_GAP} cell={CELL} />
      {scene.dots.map(d => {
        const { x, y } = d.place.area === 'frame' ? frameXY(d.place.slot) : sideXY(d.place.slot);
        return (
          <g key={d.id} className={`mv dot dot-${d.color}${d.removed ? ' removed' : ''}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
            <circle cx={CELL / 2} cy={CELL / 2} r={CELL / 2 - 6} />
            {d.removed && (
              <path d={`M ${CELL / 2 - 9} ${CELL / 2 - 9} L ${CELL / 2 + 9} ${CELL / 2 + 9} M ${CELL / 2 + 9} ${CELL / 2 - 9} L ${CELL / 2 - 9} ${CELL / 2 + 9}`} className="cross" />
            )}
          </g>
        );
      })}
    </svg>
  );
}
