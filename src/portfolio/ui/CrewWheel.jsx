import { useCallback, useEffect, useRef, useState } from 'react';
import { accumulateWheelDelta, wheelMode, wheelOffset, wheelPosition, wheelRail, wheelSize } from '../domain/navigation';

export default function CrewWheel({ crew, selected, onSelect }) {
  const wheelRef = useRef(null);
  const buttons = useRef([]);
  const gesture = useRef(null);
  const suppressClick = useRef(0);
  const lastWheel = useRef(0);
  const wheelDelta = useRef(0);
  const lastWheelAt = useRef(0);
  const focusRequested = useRef(false);
  const [size, setSize] = useState({ width: 220, compact: false, short: false, medium: false });
  const sizeRef = useRef(size);
  const dimensions = wheelSize(size.compact, size.short, size.medium, size.wideShort);
  const focusPosition = wheelPosition(0, size.width, size.compact, size.short, size.medium, size.wideShort);
  const choose = useCallback((index, focus = false) => {
    const target = ((index % crew.length) + crew.length) % crew.length;
    const activeIsOption = buttons.current.includes(document.activeElement);
    focusRequested.current = target !== selected && (focus || activeIsOption);
    if (target !== selected) onSelect(target);
  }, [crew.length, onSelect, selected]);
  useEffect(() => {
    const element = wheelRef.current;
    const update = () => {
      const width = element.getBoundingClientRect().width;
      const next = { width, ...wheelMode(window.innerWidth, window.innerHeight) };
      const previous = sizeRef.current;
      if (previous.compact !== next.compact && buttons.current.includes(document.activeElement)) focusRequested.current = true;
      sizeRef.current = next;
      setSize(current => current.width === next.width && current.compact === next.compact && current.short === next.short && current.medium === next.medium && current.wideShort === next.wideShort ? current : next);
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener('resize', update);
    update();
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, []);
  useEffect(() => {
    const element = wheelRef.current;
    const scroll = event => {
      if (event.ctrlKey || !event.deltaY) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastWheelAt.current > 180) wheelDelta.current = 0;
      lastWheelAt.current = now;
      const accumulated = accumulateWheelDelta(wheelDelta.current, event.deltaY);
      wheelDelta.current = accumulated.total;
      if (!accumulated.ready || now - lastWheel.current < 240) return;
      lastWheel.current = now;
      wheelDelta.current = 0;
      choose(selected + accumulated.direction);
    };
    element.addEventListener('wheel', scroll, { passive: false });
    return () => element.removeEventListener('wheel', scroll);
  }, [choose, selected]);
  useEffect(() => {
    const focused = document.activeElement;
    if (focusRequested.current || (wheelRef.current.contains(focused) && focused.hidden)) buttons.current[selected]?.focus();
    focusRequested.current = false;
  }, [selected, size.compact]);

  return (
    <>
      <nav
        className="crew-wheel"
        aria-label="Character switcher wheel"
        ref={wheelRef}
        style={{ '--crew-wheel-width': `${dimensions.width}px`, '--crew-wheel-height': `${dimensions.height}px` }}
        onKeyDown={event => {
          if (event.isComposing || event.keyCode === 229 || event.altKey || event.metaKey || event.ctrlKey) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            choose(selected + (event.key === 'ArrowRight' ? 1 : -1), true);
          } else if (/^[1-5]$/.test(event.key)) { event.preventDefault(); choose(Number(event.key) - 1, true); }
        }}
        onPointerDown={event => {
          if (event.button === 0) gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
        }}
        onPointerMove={event => {
          const drag = gesture.current;
          if (!drag || drag.id !== event.pointerId) return;
          const dx = event.clientX - drag.x;
          const dy = event.clientY - drag.y;
          if (Math.abs(dy) > Math.abs(dx)) { gesture.current = null; return; }
          if (Math.abs(dx) < 36) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          choose(selected + (dx < 0 ? 1 : -1));
          suppressClick.current = event.timeStamp + 300;
          gesture.current = null;
        }}
        onPointerUp={() => { gesture.current = null; }}
        onPointerCancel={() => { gesture.current = null; }}
      >
        <pre className="wheel-rail" aria-hidden="true" style={{ fontSize: `${Math.min(8, size.width / (72 * 0.6))}px` }}>{wheelRail(size.compact, size.short)}</pre>
        {!size.compact && <span className="wheel-center" aria-hidden="true"><strong>{crew[selected]?.name}</strong><small>{crew[selected]?.section}</small></span>}
        <span className="wheel-selection-frame" aria-hidden="true" style={{ '--wheel-x': `${focusPosition.x}px`, '--wheel-y': `${focusPosition.y}px`, '--wheel-scale': focusPosition.scale }}>
          <span className="wheel-selection-frame__corner wheel-selection-frame__corner--tl" />
          <span className="wheel-selection-frame__corner wheel-selection-frame__corner--tr" />
          <span className="wheel-selection-frame__corner wheel-selection-frame__corner--bl" />
          <span className="wheel-selection-frame__corner wheel-selection-frame__corner--br" />
        </span>
        {crew.map((member, index) => {
          const offset = wheelOffset(index, selected, crew.length);
          const position = wheelPosition(offset, size.width, size.compact, size.short, size.medium, size.wideShort);
          return <button
            key={member.id}
            ref={node => { buttons.current[index] = node; }}
            type="button"
            className="crew-option"
            aria-label={`${member.name}, ${member.role}, ${member.section}`}
            aria-pressed={index === selected}
            hidden={position.hidden}
            style={{ '--wheel-x': `${position.x}px`, '--wheel-y': `${position.y}px`, '--wheel-scale': position.scale, zIndex: 5 - Math.abs(offset) }}
            onClick={event => { if (event.timeStamp >= suppressClick.current) choose(index); }}
          ><strong>{member.name}</strong><small>{member.section}</small></button>;
        })}
      </nav>
      <div className="wheel-controls">
        <button type="button" aria-label="Previous character" onClick={() => choose(selected - 1)}>←</button>
        <span>scroll / drag / 1–5</span>
        <button type="button" aria-label="Next character" onClick={() => choose(selected + 1)}>→</button>
      </div>
    </>
  );
}
