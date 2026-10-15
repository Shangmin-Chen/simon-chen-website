import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { signedCircularOffset, wrapIndex } from '../domain/navigation';

export default function useSelectorPhase(selected, count, enabled) {
  const [phase, setPhase] = useState(selected);
  const phaseRef = useRef(selected);
  const targetRef = useRef(selected);
  const logicalRef = useRef(selected);
  const previewRef = useRef(null);
  const frameRef = useRef(0);

  const stop = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
  }, []);

  const animateToTarget = useCallback(allowMotion => {
    stop();
    if (!allowMotion) {
      phaseRef.current = targetRef.current;
      setPhase(targetRef.current);
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
    if (previewRef.current !== null) {
      targetRef.current += signedCircularOffset(logicalRef.current, targetRef.current, count);
    }
    previewRef.current = null;
    logicalRef.current = wrapIndex(logicalRef.current + delta, count);
    targetRef.current += delta;
    animateToTarget(enabled);
    return logicalRef.current;
  }, [animateToTarget, count, enabled]);

  const moveTo = useCallback(index => {
    const next = wrapIndex(index, count);
    return moveBy(signedCircularOffset(next, logicalRef.current, count));
  }, [count, moveBy]);

  const previewBy = useCallback(steps => {
    if (!Number.isFinite(steps)) return previewRef.current ?? logicalRef.current;
    const delta = Math.trunc(steps);
    if (!delta) return previewRef.current ?? logicalRef.current;
    const from = previewRef.current ?? logicalRef.current;
    previewRef.current = wrapIndex(from + delta, count);
    targetRef.current += delta;
    animateToTarget(enabled);
    return previewRef.current;
  }, [animateToTarget, count, enabled]);

  const commitPreview = useCallback(() => {
    if (previewRef.current === null) return logicalRef.current;
    logicalRef.current = previewRef.current;
    previewRef.current = null;
    return logicalRef.current;
  }, []);

  const cancelPreview = useCallback(() => {
    if (previewRef.current === null) return logicalRef.current;
    previewRef.current = null;
    targetRef.current += signedCircularOffset(logicalRef.current, targetRef.current, count);
    animateToTarget(enabled);
    return logicalRef.current;
  }, [animateToTarget, count, enabled]);

  useLayoutEffect(() => {
    const next = wrapIndex(selected, count);
    if (next === logicalRef.current) return;
    const delta = signedCircularOffset(next, logicalRef.current, count);
    if (previewRef.current !== null) {
      targetRef.current += signedCircularOffset(logicalRef.current, targetRef.current, count);
    }
    logicalRef.current = next;
    previewRef.current = null;
    targetRef.current += delta;
    animateToTarget(enabled);
  }, [animateToTarget, count, enabled, selected]);

  useEffect(() => {
    if (!enabled) animateToTarget(false);
    else animateToTarget(true);
  }, [animateToTarget, enabled]);

  useEffect(() => stop, [stop]);

  return { phase, moveBy, moveTo, previewBy, commitPreview, cancelPreview };
}
