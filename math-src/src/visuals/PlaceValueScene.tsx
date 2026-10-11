import type { Chip, BlockZone, PlaceCol, PlaceValueScene as Scene } from '../math/scene';

const COLS: PlaceCol[] = ['h', 't', 'o'];
const HEAD: Record<PlaceCol, string> = { h: '百位', t: '十位', o: '個位' };
const LEFT = 10;
const PER_ROW = 4; // 4 × 5 = 20 counters fit in a column, the most any step needs
const R = 12; // counter radius
const STEP = 27;
const PAD = 9;
const COL_W = PAD * 2 + PER_ROW * STEP + 8;
const BOX_H = PAD * 2 + 5 * STEP - 3;
const MAIN_Y = 60;
export const SECOND_Y = MAIN_Y + BOX_H + 66;
export const PV_WIDTH = LEFT + 3 * COL_W;

export function placeValueHeight(hasLower: boolean) {
  return (hasLower ? SECOND_Y : MAIN_Y) + BOX_H + 10;
}

const zoneY = (z: BlockZone) => (z === 'main' ? MAIN_Y : SECOND_Y);
const colX = (c: PlaceCol) => LEFT + COLS.indexOf(c) * COL_W;

/** `pile` = index within a stack of bundled counters; each one sits a little higher so it reads as a pile. */
function position(c: Chip, pile = 0, awaySlot?: number) {
  const { zone, col, slot } = c.place;
  // A taken-away counter slides into the same column of the lower "拿走的" area.
  const z: BlockZone = awaySlot !== undefined ? 'second' : zone;
  const s = awaySlot ?? slot;
  return {
    x: colX(col) + PAD + (s % PER_ROW) * STEP + R + pile * 0.8,
    y: zoneY(z) + PAD + Math.floor(s / PER_ROW) * STEP + R - pile * 1.4,
  };
}

function counts(chips: Chip[], zone: BlockZone) {
  const live = chips.filter(c => c.place.zone === zone && !c.removed && !c.hidden && !c.place.stack);
  return Object.fromEntries(COLS.map(col => [col, live.filter(c => c.place.col === col).length])) as Record<PlaceCol, number>;
}

/** Counters that were taken away, in the order they leave (hundreds column first, highest slot first). */
function takenAway(chips: Chip[]) {
  return chips
    .filter(c => c.removed && !c.hidden)
    .sort((x, y) => COLS.indexOf(x.place.col) - COLS.indexOf(y.place.col) || y.place.slot - x.place.slot);
}

function Zone({ zone, label, n, away = false }: { zone: BlockZone; label?: string; n: Record<PlaceCol, number>; away?: boolean }) {
  const y = zoneY(zone);
  return (
    <g>
      {label && <text x={LEFT} y={y - 32} className="scene-label">{label}</text>}
      {COLS.map(col => (
        <g key={col}>
          <text x={colX(col) + (COL_W - 8) / 2} y={y - 8} className="pv-head" textAnchor="middle">{`${HEAD[col]}：${n[col]}`}</text>
          <rect x={colX(col)} y={y} width={COL_W - 8} height={BOX_H} rx={10} className={`pv-col pv-col-${col}${away ? ' away' : ''}`} />
        </g>
      ))}
    </g>
  );
}

function stackIndex(chips: Chip[], c: Chip) {
  const same = chips.filter(o => o.place.stack && !o.hidden && o.place.zone === c.place.zone && o.place.col === c.place.col && o.place.slot === c.place.slot);
  return same.indexOf(c);
}

/**
 * 小二 1000 以內：位值表，每個圓片上寫著它代表多少（100／10／1）。
 * 減法（hasAway）：被拿走的圓片一個一個滑到下面的「拿走的」位值表。
 */
export function PlaceValueScene({ scene, hasSecond, hasAway = false }: { scene: Scene; hasSecond: boolean; hasAway?: boolean }) {
  const showSecond = hasSecond && scene.chips.some(c => c.place.zone === 'second');
  const n = counts(scene.chips, 'main');
  const away = takenAway(scene.chips);
  const awayN = Object.fromEntries(COLS.map(col => [col, away.filter(c => c.place.col === col).length])) as Record<PlaceCol, number>;
  return (
    <svg
      viewBox={`0 0 ${PV_WIDTH} ${placeValueHeight(hasSecond || hasAway)}`}
      className="scene"
      role="img"
      aria-label={`位值表：百位 ${n.h} 個、十位 ${n.t} 個、個位 ${n.o} 個${away.length ? `；拿走了百位 ${awayN.h} 個、十位 ${awayN.t} 個、個位 ${awayN.o} 個` : ''}`}
    >
      <Zone zone="main" label={scene.mainLabel} n={n} />
      {showSecond && <Zone zone="second" label={scene.secondLabel} n={counts(scene.chips, 'second')} />}
      {hasAway && <Zone zone="second" label="拿走的" n={awayN} away />}
      {scene.chips.map(c => {
        const pile = c.place.stack ? stackIndex(scene.chips, c) : 0;
        const k = c.removed ? away.indexOf(c) : -1;
        const slotInCol = k >= 0 ? away.filter(o => o.place.col === c.place.col).indexOf(c) : undefined;
        const { x, y } = position(c, pile, slotInCol);
        const cls = `mv pchip pchip-${c.color} v${c.value}${c.removed ? ' removed' : ''}${c.hidden ? ' gone' : ''}${c.place.stack ? ' stacked' : ''}`;
        return (
          <g
            key={c.id}
            className={cls}
            style={{ transform: `translate(${x}px, ${y}px)`, transitionDelay: k >= 0 ? `${Math.min(k * 80, 640)}ms` : '0ms' }}
          >
            <circle r={R} />
            <text y={c.value === 1 ? 4 : 3.5} textAnchor="middle" className="pchip-num">{c.value}</text>
          </g>
        );
      })}
    </svg>
  );
}
