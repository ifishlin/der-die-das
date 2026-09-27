import { useCallback, useEffect, useRef, useState } from 'react';

export type StepControls = {
  index: number;
  playing: boolean;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  replay: () => void;
};

/**
 * Drives a step-by-step animation.
 * - `resetKey` changes when the question changes: the index goes back to 0 and any pending timer
 *   of the old question is cancelled, so a delayed step can never land on the new question.
 * - `maxStep` limits how far the child can go (used before the answer is revealed).
 */
export function useAnimationSteps(durations: number[], resetKey: string, maxStep: number): StepControls {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const keyRef = useRef(resetKey);
  const last = Math.min(maxStep, durations.length - 1);

  useEffect(() => {
    keyRef.current = resetKey;
    setIndex(0);
    setPlaying(false);
  }, [resetKey]);

  useEffect(() => {
    if (index > last) setIndex(Math.max(0, last));
  }, [index, last]);

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const key = keyRef.current;
    const t = window.setTimeout(() => {
      if (keyRef.current !== key) return;
      setIndex(i => Math.min(i + 1, last));
    }, durations[index] ?? 2000);
    return () => window.clearTimeout(t);
  }, [playing, index, last, durations]);

  const play = useCallback(() => {
    setIndex(i => (i >= last ? 0 : i));
    setPlaying(true);
  }, [last]);
  const pause = useCallback(() => setPlaying(false), []);
  const next = useCallback(() => {
    setPlaying(false);
    setIndex(i => Math.min(i + 1, last));
  }, [last]);
  const prev = useCallback(() => {
    setPlaying(false);
    setIndex(i => Math.max(i - 1, 0));
  }, []);
  const replay = useCallback(() => {
    setIndex(0);
    setPlaying(true);
  }, []);

  return { index, playing, play, pause, next, prev, replay };
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
