import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { generateExplanation } from '../math/explanations';
import type { BlocksScene, DotsScene as DotsSceneData, PlaceValueScene as PlaceValueSceneData } from '../math/scene';
import type { Grade, Operator, Question } from '../math/types';
import { DotsScene, SIDE_X } from '../visuals/DotsScene';
import { AWAY_Y, BaseTenScene } from '../visuals/BaseTenScene';
import { PlaceValueScene, SECOND_Y } from '../visuals/PlaceValueScene';

const q = (grade: Grade, operator: Operator, left: number, right: number): Question => ({ id: 't', grade, operator, left, right, tags: [] });
const steps = (question: Question) => generateExplanation(question).steps;
const lastScene = (question: Question) => { const all = steps(question); return all[all.length - 1].scene; };

/** translate(Xpx, Ypx) → [X, Y] */
function xy(el: Element): [number, number] {
  const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec((el as HTMLElement).style.transform);
  if (!m) throw new Error('no translate on ' + (el as HTMLElement).outerHTML.slice(0, 80));
  return [Number(m[1]), Number(m[2])];
}
const delay = (el: Element) => parseFloat((el as HTMLElement).style.transitionDelay || '0');

afterEach(cleanup);

describe('subtraction: taken-away items move to the other side instead of being crossed out', () => {
  it('grade 1 dots: removed dots sit in the right-hand "拿走的" area, nothing is crossed out', () => {
    const last = lastScene(q(1, 'subtract', 13, 6)) as DotsSceneData;
    const { container } = render(<DotsScene scene={last} hasAway />);
    expect(container.querySelectorAll('.cross, path')).toHaveLength(0);
    const gone = [...container.querySelectorAll('.dot.removed')];
    const kept = [...container.querySelectorAll('.dot:not(.removed)')];
    expect(gone).toHaveLength(6);
    expect(kept).toHaveLength(7);
    expect(gone.every(d => xy(d)[0] >= SIDE_X)).toBe(true);
    expect(kept.every(d => xy(d)[0] < SIDE_X)).toBe(true);
    expect(container.textContent).toContain('拿走的：6 個');
  });

  it('they leave one after another (staggered), so every move can be watched', () => {
    const last = lastScene(q(1, 'subtract', 13, 6)) as DotsSceneData;
    const { container } = render(<DotsScene scene={last} hasAway />);
    const delays = [...container.querySelectorAll('.dot.removed')].map(delay).sort((a, b) => a - b);
    expect(delays[0]).toBe(0);
    expect(new Set(delays).size).toBe(delays.length);
    expect([...container.querySelectorAll('.dot:not(.removed)')].every(d => delay(d) === 0)).toBe(true);
  });

  it('the empty "拿走的" area is shown from the first step, so the picture does not jump later', () => {
    const first = steps(q(1, 'subtract', 13, 6))[0].scene as DotsSceneData;
    const { container } = render(<DotsScene scene={first} hasAway />);
    expect(container.querySelectorAll('.dot.removed')).toHaveLength(0);
    expect(container.querySelector('.away-box')).not.toBeNull();
    expect(container.textContent).toContain('拿走的');
    cleanup();
    // an addition has no such area
    const add = lastScene(q(1, 'add', 8, 5)) as DotsSceneData;
    expect(render(<DotsScene scene={add} />).container.querySelector('.away-box')).toBeNull();
  });

  it('7 − 7: every dot moves over and the ten-frames are left empty', () => {
    const last = lastScene(q(1, 'subtract', 7, 7)) as DotsSceneData;
    const { container } = render(<DotsScene scene={last} hasAway />);
    const gone = [...container.querySelectorAll('.dot.removed')];
    expect(gone).toHaveLength(7);
    expect(gone.every(d => xy(d)[0] >= SIDE_X)).toBe(true);
    expect(container.querySelectorAll('.dot:not(.removed)')).toHaveLength(0);
  });

  it('grade 2 blocks: removed bars and squares slide down into the "拿走的" area', () => {
    const last = lastScene(q(2, 'subtract', 52, 27)) as BlocksScene;
    const { container } = render(<BaseTenScene scene={last} hasSecond={false} hasAway />);
    expect(container.querySelectorAll('.cross, path')).toHaveLength(0);
    const gone = [...container.querySelectorAll('.block.removed')];
    expect(gone).toHaveLength(2 + 7); // 2 tens + 7 ones
    expect(gone.every(b => xy(b)[1] >= AWAY_Y)).toBe(true);
    const kept = [...container.querySelectorAll('.block:not(.removed):not(.gone)')];
    expect(kept).toHaveLength(2 + 5);
    expect(kept.every(b => xy(b)[1] < AWAY_Y)).toBe(true);
    expect(container.textContent).toContain('十位 2 條　個位 7 個'); // the taken-away tally
    const delays = gone.map(delay);
    expect(new Set(delays).size).toBe(delays.length);
  });

  it('grade 2 place value (above 100): removed counters slide into the lower chart, column by column', () => {
    const last = lastScene(q(2, 'subtract', 503, 278)) as PlaceValueSceneData;
    const { container } = render(<PlaceValueScene scene={last} hasSecond={false} hasAway />);
    expect(container.querySelectorAll('.cross, path')).toHaveLength(0);
    const gone = [...container.querySelectorAll('.pchip.removed')];
    expect(gone).toHaveLength(2 + 7 + 8);
    expect(gone.every(c => xy(c)[1] >= SECOND_Y)).toBe(true);
    const kept = [...container.querySelectorAll('.pchip:not(.removed):not(.gone)')];
    expect(kept).toHaveLength(2 + 2 + 5);
    expect(kept.every(c => xy(c)[1] < SECOND_Y)).toBe(true);
    // the lower chart counts what was taken: 2 hundreds, 7 tens, 8 ones
    const heads = [...container.querySelectorAll('.pv-head')].map(t => t.textContent);
    expect(heads.slice(-3)).toEqual(['百位：2', '十位：7', '個位：8']);
    expect(container.querySelectorAll('.pv-col.away')).toHaveLength(3);
  });

  it('every subtraction step of every picture type shows the "拿走的" area, with no crosses', () => {
    const cases: Question[] = [q(1, 'subtract', 13, 6), q(1, 'subtract', 20, 9), q(2, 'subtract', 52, 27), q(2, 'subtract', 100, 58), q(2, 'subtract', 503, 278), q(2, 'subtract', 1000, 1)];
    for (const question of cases) {
      for (const st of steps(question)) {
        const s = st.scene;
        const { container } = render(
          s.kind === 'dots' ? <DotsScene scene={s} hasAway /> : s.kind === 'blocks' ? <BaseTenScene scene={s} hasSecond={false} hasAway /> : s.kind === 'placevalue' ? <PlaceValueScene scene={s} hasSecond={false} hasAway /> : <></>,
        );
        expect(container.querySelectorAll('.cross, path'), `${question.left}-${question.right}: ${st.caption}`).toHaveLength(0);
        expect(container.textContent, st.caption).toContain('拿走的');
        cleanup();
      }
    }
  });

  it('captions say where the taken-away part goes, not "crossed out"', () => {
    for (const question of [q(1, 'subtract', 13, 6), q(2, 'subtract', 52, 27), q(2, 'subtract', 503, 278)]) {
      const captions = steps(question).map(s => s.caption).join(' ');
      expect(captions).not.toContain('打叉');
      expect(captions).toMatch(/移到/);
    }
  });
});
