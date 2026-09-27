import type { ArrayScene } from '../math/scene';

const WIDTH = 380;
const LABEL_W = 62;
const TOP = 44;

/** 小二乘法：每一列是一組，逐組亮起。10 × 10 時自動縮小點的大小。 */
export function MultiplicationScene({ scene }: { scene: ArrayScene }) {
  const cell = Math.min(30, Math.floor((WIDTH - LABEL_W - 50) / scene.perGroup));
  const rowH = cell + 8;
  const height = TOP + scene.groups * rowH + 10;
  const r = Math.max(4, cell / 2 - 3);
  return (
    <svg viewBox={`0 0 ${WIDTH} ${height}`} className="scene" role="img" aria-label={`圖解：${scene.groups} 組，每組 ${scene.perGroup} 個，已經亮起 ${scene.lit} 組`}>
      <text x={10} y={28} className="scene-label">{scene.readout}</text>
      {Array.from({ length: scene.groups }, (_, g) => {
        const on = g < scene.lit;
        const y = TOP + g * rowH;
        return (
          <g key={g} className={`group${on ? ' on' : ''}`}>
            <text x={10} y={y + cell / 2 + 6} className="group-label">{`第 ${g + 1} 組`}</text>
            <rect x={LABEL_W - 4} y={y - 2} width={scene.perGroup * cell + 8} height={cell + 4} rx={8} className="group-box" />
            {Array.from({ length: scene.perGroup }, (_, i) => (
              <circle key={i} cx={LABEL_W + i * cell + cell / 2} cy={y + cell / 2} r={r} className="mdot" />
            ))}
            {on && (
              <text x={LABEL_W + scene.perGroup * cell + 12} y={y + cell / 2 + 5} className="group-sum">
                {scene.perGroup * (g + 1)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
