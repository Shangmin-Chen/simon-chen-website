import { useCallback, useEffect, useRef, useState } from 'react';

export default function useSignalBurst(enabled, duration = 320, frames = 8) {
  const [burst, setBurst] = useState({ enabled, tick: -1 });
  const interval = useRef(0);
  if (burst.enabled !== enabled) setBurst({ enabled, tick: -1 });

  const clear = useCallback(() => {
    clearInterval(interval.current);
    interval.current = 0;
  }, []);

  const stop = useCallback(() => {
    clear();
    setBurst(current => current.enabled === enabled ? { enabled, tick: -1 } : current);
  }, [clear, enabled]);

  const start = useCallback(() => {
    if (!enabled || document.visibilityState === 'hidden') return;
    clear();
    let frame = 0;
    setBurst({ enabled, tick: frame });
    interval.current = window.setInterval(() => {
      frame += 1;
      if (frame >= frames) {
        stop();
        return;
      }
      setBurst(current => current.enabled === enabled ? { enabled, tick: frame } : current);
    }, duration / frames);
  }, [clear, duration, enabled, frames, stop]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') stop();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    if (!enabled) clear();
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clear();
    };
  }, [clear, enabled, stop]);

  return { tick: enabled && burst.enabled ? burst.tick : -1, start };
}
