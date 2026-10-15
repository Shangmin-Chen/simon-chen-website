import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { signedCircularOffset, wrapIndex } from '../domain/navigation';

export default function useSelectorPhase(selected, count, enabled) {
  const [phase, setPhase] = useState(selected);
  const phaseRef = useRef(selected);
  const targetRef = useRef(selected);
  const logicalRef = useRef(selected);
  const frameRef = useRef(0);

  const stop = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
  }, []);

  const animateToTarget = useCallback(allowMotion => {
    stop();
    if (!allowMotion) {
      targetRef.current = logicalRef.current;
      phaseRef.current = logicalRef.current;
      setPhase(logicalRef.current);
      return;
    }

    const from = phaseRef.current;
    const to = targetRef.current;
    const distance = Math.abs(to - from);
    if (distance < 0.001) return;

    const startTime = performance.now();
    const duration = Math.min(720, 220 + distance * 100);
    const tick = now => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const next = from + (to - from) * eased;
      phaseRef.current = next;
      setPhase(next);
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
      else {
        phaseRef.current = to;
        frameRef.current = 0;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [stop]);

  const moveBy = useCallback(steps => {
    if (!Number.isFinite(steps)) return logicalRef.current;
    const delta = Math.trunc(steps);
    if (!delta) return logicalRef.current;
    logicalRef.current = wrapIndex(logicalRef.current + delta, count);
    targetRef.current += delta;
    animateToTarget(enabled);
    return logicalRef.current;
  }, [animateToTarget, count, enabled]);

  const moveTo = useCallback(index => {
    const next = wrapIndex(index, count);
    return moveBy(signedCircularOffset(next, logicalRef.current, count));
  }, [count, moveBy]);

  useLayoutEffect(() => {
    const next = wrapIndex(selected, count);
    if (next === logicalRef.current) return;
    const delta = signedCircularOffset(next, logicalRef.current, count);
    logicalRef.current = next;
    targetRef.current += delta;
    animateToTarget(enabled);
  }, [animateToTarget, count, enabled, selected]);

  useEffect(() => {
    if (!enabled) animateToTarget(false);
    else animateToTarget(true);
  }, [animateToTarget, enabled]);

  useEffect(() => stop, [stop]);

  return { phase, moveBy, moveTo };
}
