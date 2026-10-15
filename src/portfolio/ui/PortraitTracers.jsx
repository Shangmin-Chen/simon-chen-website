import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { portraitEyePoints, tracerSegment } from '../domain/portrait-tracers.js';

export default function PortraitTracers({ portrait, textRef, gazeX = 0, active, onPointerTargetChange }) {
  const [segments, setSegments] = useState([]);
  const gazeRef = useRef(gazeX);
  const scheduleRef = useRef(null);

  useEffect(() => {
    let cursor = null;
    let frame = 0;
    let disposed = false;

    const clear = () => {
      cursor = null;
      onPointerTargetChange(null);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      setSegments([]);
    };
    const update = () => {
      frame = 0;
      if (disposed || !active || !cursor || !textRef.current || !portrait.eyes?.length) {
        setSegments([]);
        return;
      }

      const text = textRef.current;
      const textRect = text.getBoundingClientRect();
      const lineHeight = Number.parseFloat(getComputedStyle(text).lineHeight);
      const charWidth = textRect.width / (portrait.width + 2);
      const eyes = portraitEyePoints(portrait, { textRect, charWidth, lineHeight, gazeX: gazeRef.current });
      const pointer = cursor;
      setSegments(eyes.map(eye => tracerSegment(eye, pointer)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    scheduleRef.current = schedule;
    const move = event => {
      if (event.pointerType === 'touch') {
        clear();
        return;
      }
      cursor = { x: event.clientX, y: event.clientY };
      onPointerTargetChange(cursor);
      schedule();
    };
    const leave = event => {
      if (!event.relatedTarget) clear();
    };
    const visibility = () => {
      if (document.hidden) clear();
    };

    if (!active) {
      clear();
      return () => { disposed = true; };
    }

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerout', leave);
    window.addEventListener('blur', clear);
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    document.addEventListener('visibilitychange', visibility);
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', schedule, { passive: true });
    viewport?.addEventListener('scroll', schedule, { passive: true });
    const fonts = document.fonts;
    fonts?.addEventListener('loadingdone', schedule);
    fonts?.ready?.then(() => { if (!disposed) schedule(); });

    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerout', leave);
      window.removeEventListener('blur', clear);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      document.removeEventListener('visibilitychange', visibility);
      viewport?.removeEventListener('resize', schedule);
      viewport?.removeEventListener('scroll', schedule);
      fonts?.removeEventListener('loadingdone', schedule);
      onPointerTargetChange(null);
      scheduleRef.current = null;
    };
  }, [active, onPointerTargetChange, portrait, textRef]);

  useEffect(() => {
    gazeRef.current = gazeX;
    scheduleRef.current?.();
  }, [gazeX]);

  if (!active || !segments.length || typeof document === 'undefined') return null;

  return createPortal(
    <div className="portrait-tracers" aria-hidden="true">
      {segments.map((segment, index) => <span className={`portrait-tracer portrait-tracer-${index}`} key={index} style={{
        left: segment.left,
        top: segment.top,
        width: segment.length,
        transform: `rotate(${segment.angle}rad)`,
      }}><i /></span>)}
    </div>,
    document.body,
  );
}
