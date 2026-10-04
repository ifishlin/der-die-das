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
const SECOND_Y = MAIN_Y + BOX_H + 66;
export const PV_WIDTH = LEFT + 3 * COL_W;

export function placeValueHeight(hasSecond: boolean) {
  return (hasSecond ? SECOND_Y : MAIN_Y) + BOX_H + 10;
}

const zoneY = (z: BlockZone) => (z === 'main' ? MAIN_Y : SECOND_Y);
const colX = (c: PlaceCol) => LEFT + COLS.indexOf(c) * COL_W;

/** `pile` = index within a stack of bundled counters; each one sits a little higher so it reads as a pile. */
function position(c: Chip, pile = 0) {
  const { zone, col, slot } = c.place;
  return {
    x: colX(col) + PAD + (slot % PER_ROW) * STEP + R + pile * 0.8,
    y: zoneY(zone) + PAD + Math.floor(slot / PER_ROW) * STEP + R - pile * 1.4,
  };
}

function counts(chips: Chip[], zone: BlockZone) {
  const live = chips.filter(c => c.place.zone === zone && !c.removed && !c.hidden && !c.place.stack);
  return Object.fromEntries(COLS.map(col => [col, live.filter(c => c.place.col === col).length])) as Record<PlaceCol, number>;
}

function Zone({ zone, label, chips }: { zone: BlockZone; label?: string; chips: Chip[] }) {
  const n = counts(chips, zone);
  const y = zoneY(zone);
  return (
    <g>
      {label && <text x={LEFT} y={y - 32} className="scene-label">{label}</text>}
      {COLS.map(col => (
        <g key={col}>
          <text x={colX(col) + (COL_W - 8) / 2} y={y - 8} className="pv-head" textAnchor="middle">{`${HEAD[col]}：${n[col]}`}</text>
          <rect x={colX(col)} y={y} width={COL_W - 8} height={BOX_H} rx={10} className={`pv-col pv-col-${col}`} />
        </g>
      ))}
    </g>
  );
}

function stackIndex(chips: Chip[], c: Chip) {
  const same = chips.filter(o => o.place.stack && !o.hidden && o.place.zone === c.place.zone && o.place.col === c.place.col && o.place.slot === c.place.slot);
  return same.indexOf(c);
}

/** 小二 1000 以內：位值表，每個圓片上寫著它代表多少（100／10／1）。 */
export function PlaceValueScene({ scene, hasSecond }: { scene: Scene; hasSecond: boolean }) {
  const showSecond = hasSecond && scene.chips.some(c => c.place.zone === 'second');
  const n = counts(scene.chips, 'main');
  return (
    <svg
      viewBox={`0 0 ${PV_WIDTH} ${placeValueHeight(hasSecond)}`}
      className="scene"
      role="img"
      aria-label={`位值表：百位 ${n.h} 個、十位 ${n.t} 個、個位 ${n.o} 個`}
    >
      <Zone zone="main" label={scene.mainLabel} chips={scene.chips} />
      {showSecond && <Zone zone="second" label={scene.secondLabel} chips={scene.chips} />}
      {scene.chips.map(c => {
        const pile = c.place.stack ? stackIndex(scene.chips, c) : 0;
        const { x, y } = position(c, pile);
        const cls = `mv pchip pchip-${c.color} v${c.value}${c.removed ? ' removed' : ''}${c.hidden ? ' gone' : ''}${c.place.stack ? ' stacked' : ''}`;
        return (
          <g key={c.id} className={cls} style={{ transform: `translate(${x}px, ${y}px)` }}>
            <circle r={R} />
            <text y={c.value === 1 ? 4 : 3.5} textAnchor="middle" className="pchip-num">{c.value}</text>
            {c.removed && <path d={`M ${-R + 2} ${-R + 2} L ${R - 2} ${R - 2} M ${R - 2} ${-R + 2} L ${-R + 2} ${R - 2}`} className="cross" />}
          </g>
        );
      })}
    </svg>
  );
}
