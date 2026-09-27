/**
 * Scene states describe *what* is on screen (which items, where they logically sit, whether they
 * are taken away). They carry no pixel positions; the SVG components in src/visuals decide layout.
 * Items keep a stable id between steps so the renderer can animate them moving or fading.
 */

export type DotColor = 'a' | 'b';

/** frame: slot 0–9 is the first ten-frame, 10–19 the second. side: waiting area for the second number. */
export type DotPlace = { area: 'frame' | 'side'; slot: number };

export type Dot = { id: string; color: DotColor; place: DotPlace; removed?: boolean };

export type DotsScene = {
  kind: 'dots';
  dots: Dot[];
  frameLabel: string;
  sideLabel?: string;
  total?: number;
};

export type BlockZone = 'main' | 'second';

/**
 * ten: slot = position of the bar in its zone.
 * one: slot = position in the ones grid, or, when `column` is set, the unit sits inside
 * an imaginary ten-bar at tens position `column` (used while 10 ones become a ten, or a ten breaks apart).
 */
export type BlockPlace = { zone: BlockZone; slot: number; column?: number };

export type Block = {
  id: string;
  kind: 'ten' | 'one';
  color: 'a' | 'b' | 'c';
  place: BlockPlace;
  /** Taken away in a subtraction: still drawn, crossed out. */
  removed?: boolean;
  /** Merged into something else: no longer drawn. */
  hidden?: boolean;
};

export type BlocksScene = {
  kind: 'blocks';
  blocks: Block[];
  mainLabel: string;
  secondLabel?: string;
  total?: number;
};

export type ArrayScene = {
  kind: 'array';
  groups: number;
  perGroup: number;
  /** How many groups are highlighted so far. */
  lit: number;
  readout: string;
  total?: number;
};

export type SceneState = DotsScene | BlocksScene | ArrayScene;

export type ExplanationStep = {
  id: string;
  caption: string;
  scene: SceneState;
  durationMs?: number;
};

export type Explanation = {
  steps: ExplanationStep[];
  /** Step shown by the second hint: part of the way, without the final answer. */
  hintStep: number;
};

/** Counts what the scene currently shows. Used by tests and by the on-screen number labels. */
export function summarize(scene: SceneState) {
  switch (scene.kind) {
    case 'dots': {
      const units = scene.dots.filter(d => !d.removed).length;
      return { kind: 'dots' as const, units, value: units };
    }
    case 'blocks': {
      const live = scene.blocks.filter(b => !b.removed && !b.hidden);
      const tens = live.filter(b => b.kind === 'ten').length;
      const ones = live.filter(b => b.kind === 'one').length;
      return { kind: 'blocks' as const, tens, ones, value: tens * 10 + ones };
    }
    case 'array':
      return { kind: 'array' as const, groups: scene.groups, perGroup: scene.perGroup, lit: scene.lit, value: scene.groups * scene.perGroup };
  }
}
