import type { Block, BlockZone, BlocksScene } from '../math/scene';

const U = 13; // one unit square
const TEN_STEP = 19; // distance between ten-bars
const ONE_STEP = 15;
const LEFT = 14;
const ZONE_H = 10 * U;
const MAIN_Y = 52;
const SECOND_Y = MAIN_Y + ZONE_H + 76;
/** The "拿走的" area sits in the same band below the main area that the second number uses in an addition. */
export const AWAY_Y = SECOND_Y;
export const BLOCKS_WIDTH = LEFT + 10 * TEN_STEP + 16 + 5 * ONE_STEP + 14;

export function blocksHeight(hasLower: boolean) {
  return (hasLower ? SECOND_Y : MAIN_Y) + ZONE_H + 16;
}

const zoneY = (z: BlockZone) => (z === 'main' ? MAIN_Y : SECOND_Y);

/** The ones grid starts right after the last ten-bar position used in that zone (taken-away bars keep their spot). */
function onesOrigin(blocks: Block[], zone: BlockZone) {
  let used = 0;
  for (const b of blocks) {
    if (b.place.zone !== zone || b.hidden) continue;
    if (b.kind === 'ten') used = Math.max(used, b.place.slot + 1);
    if (b.kind === 'one' && b.place.column !== undefined) used = Math.max(used, b.place.column + 1);
  }
  return LEFT + used * TEN_STEP + 16;
}

function position(b: Block, blocks: Block[]) {
  const y0 = zoneY(b.place.zone);
  if (b.kind === 'ten') return { x: LEFT + b.place.slot * TEN_STEP, y: y0 };
  if (b.place.column !== undefined) return { x: LEFT + b.place.column * TEN_STEP, y: y0 + b.place.slot * U };
  const ox = onesOrigin(blocks, b.place.zone);
  return { x: ox + (b.place.slot % 5) * ONE_STEP, y: y0 + Math.floor(b.place.slot / 5) * ONE_STEP };
}

type Away = { tens: Block[]; ones: Block[] };

/** Blocks that were taken away, in the order they leave (highest slot first). */
function takenAway(blocks: Block[]): Away {
  const gone = blocks.filter(b => b.removed && !b.hidden).sort((x, y) => y.place.slot - x.place.slot);
  return { tens: gone.filter(b => b.kind === 'ten'), ones: gone.filter(b => b.kind === 'one') };
}

/**
 * Where a taken-away block lands. The ones grid uses the same left edge as the ones in the main area, so
 * ones that already moved never get pushed aside when the tens arrive later; the tens stack up from the left.
 */
function awayPosition(b: Block, away: Away, onesX: number) {
  if (b.kind === 'ten') return { x: LEFT + away.tens.indexOf(b) * TEN_STEP, y: AWAY_Y };
  const k = away.ones.indexOf(b);
  return { x: onesX + (k % 5) * ONE_STEP, y: AWAY_Y + Math.floor(k / 5) * ONE_STEP };
}

function count(blocks: Block[], zone: BlockZone) {
  const live = blocks.filter(b => b.place.zone === zone && !b.hidden && !b.removed);
  return { tens: live.filter(b => b.kind === 'ten').length, ones: live.filter(b => b.kind === 'one').length };
}

/**
 * 小二加減法：一條 = 10，一個小方塊 = 1。
 * 減法（hasAway）：被拿走的積木一個一個滑到下面的「拿走的」區。
 */
export function BaseTenScene({ scene, hasSecond, hasAway = false }: { scene: BlocksScene; hasSecond: boolean; hasAway?: boolean }) {
  const main = count(scene.blocks, 'main');
  const second = count(scene.blocks, 'second');
  const away = takenAway(scene.blocks);
  const order = [...away.tens, ...away.ones];
  const awayOnesX = onesOrigin(scene.blocks, 'main');
  const showSecond = hasSecond && scene.blocks.some(b => b.place.zone === 'second');
  const h = blocksHeight(hasSecond || hasAway);
  return (
    <svg
      viewBox={`0 0 ${BLOCKS_WIDTH} ${h}`}
      className="scene"
      role="img"
      aria-label={`圖解：${main.tens} 條十位和 ${main.ones} 個個位${showSecond ? `；下面還有 ${second.tens} 條十位和 ${second.ones} 個個位` : ''}${order.length ? `；拿走了 ${away.tens.length} 條十位和 ${away.ones.length} 個個位` : ''}`}
    >
      <text x={LEFT} y={20} className="scene-label">{scene.mainLabel}</text>
      <text x={LEFT} y={40} className="scene-count">{`十位 ${main.tens} 條　個位 ${main.ones} 個`}</text>
      {showSecond && (
        <>
          <line x1={LEFT} x2={BLOCKS_WIDTH - 14} y1={SECOND_Y - 50} y2={SECOND_Y - 50} className="divider" />
          <text x={LEFT} y={SECOND_Y - 32} className="scene-label">{scene.secondLabel}</text>
          <text x={LEFT} y={SECOND_Y - 12} className="scene-count">{`十位 ${second.tens} 條　個位 ${second.ones} 個`}</text>
        </>
      )}
      {hasAway && (
        <>
          <rect x={LEFT - 6} y={AWAY_Y - 8} width={BLOCKS_WIDTH - 2 * LEFT + 12} height={ZONE_H + 16} rx={10} className="away-box" />
          <text x={LEFT} y={AWAY_Y - 34} className="scene-label">拿走的</text>
          <text x={LEFT} y={AWAY_Y - 16} className="scene-count">{`十位 ${away.tens.length} 條　個位 ${away.ones.length} 個`}</text>
        </>
      )}
      {scene.blocks.map(b => {
        const k = b.removed ? order.indexOf(b) : -1;
        const { x, y } = k >= 0 ? awayPosition(b, away, awayOnesX) : position(b, scene.blocks);
        const cls = `mv block block-${b.color}${b.removed ? ' removed' : ''}${b.hidden ? ' gone' : ''}`;
        return (
          <g
            key={b.id}
            className={cls}
            style={{ transform: `translate(${x}px, ${y}px)`, transitionDelay: k >= 0 ? `${Math.min(k * 80, 640)}ms` : '0ms' }}
          >
            {b.kind === 'ten' ? (
              <>
                <rect width={U} height={ZONE_H} rx={2} />
                {Array.from({ length: 9 }, (_, i) => (
                  <line key={i} x1={0} x2={U} y1={(i + 1) * U} y2={(i + 1) * U} className="seg" />
                ))}
              </>
            ) : (
              <rect width={U} height={U} rx={2} />
            )}
          </g>
        );
      })}
    </svg>
  );
}
