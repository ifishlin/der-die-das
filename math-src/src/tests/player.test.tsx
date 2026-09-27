import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnimationPlayer } from '../components/AnimationPlayer';
import { generateExplanation } from '../math/explanations';
import type { Question } from '../math/types';

/** Each step schedules the next timer after React re-renders, so advance the clock step by step. */
const runTimers = (ms: number) => {
  for (let t = 0; t < ms; t += 500) act(() => vi.advanceTimersByTime(500));
};

const q1: Question = { id: 'q1', grade: 1, operator: 'add', left: 8, right: 5, tags: [] };
const q2: Question = { id: 'q2', grade: 2, operator: 'multiply', left: 3, right: 4, tags: [] };

describe('AnimationPlayer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('steps forward and back, plays, pauses and replays', () => {
    const ex = generateExplanation(q1);
    render(<AnimationPlayer explanation={ex} resetKey="q1" maxStep={ex.steps.length - 1} />);
    expect(screen.getByText(ex.steps[0].caption)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('下一個步驟'));
    expect(screen.getByText(ex.steps[1].caption)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('上一個步驟'));
    expect(screen.getByText(ex.steps[0].caption)).toBeTruthy();

    fireEvent.click(screen.getByLabelText('播放動畫'));
    runTimers(60_000);
    expect(screen.getByText(ex.steps[ex.steps.length - 1].caption)).toBeTruthy();

    fireEvent.click(screen.getByLabelText('重播動畫'));
    expect(screen.getByText(ex.steps[0].caption)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('暫停動畫'));
    runTimers(60_000);
    expect(screen.getByText(ex.steps[0].caption)).toBeTruthy();
  });

  it('does not let the child past maxStep', () => {
    const ex = generateExplanation(q1);
    render(<AnimationPlayer explanation={ex} resetKey="q1" maxStep={0} />);
    expect((screen.getByLabelText('下一個步驟') as HTMLButtonElement).disabled).toBe(true);
  });

  it('switching question leaves nothing of the old one, even with a timer pending', () => {
    const e1 = generateExplanation(q1);
    const e2 = generateExplanation(q2);
    const { rerender, container } = render(<AnimationPlayer explanation={e1} resetKey="q1" maxStep={e1.steps.length - 1} />);
    fireEvent.click(screen.getByLabelText('播放動畫'));
    runTimers(3000); // q1 is mid-animation, next timer pending
    rerender(<AnimationPlayer explanation={e2} resetKey="q2" maxStep={e2.steps.length - 1} />);
    runTimers(60_000);
    expect(screen.getByText(e2.steps[0].caption)).toBeTruthy();
    expect(container.textContent).not.toContain('藍點');
    expect(container.querySelectorAll('.dot')).toHaveLength(0);
    expect(container.querySelectorAll('.mdot')).toHaveLength(12);
  });
});
