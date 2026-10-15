import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { accumulateWheelDelta, sectionSelectorPositions, sectionSelectorStageHeight } from '../domain/navigation';
import NameCycle from './NameCycle';

const sectionLabel = section => `${section[0].toUpperCase()}${section.slice(1)}`;

export default function CharacterSelector({ crew, selected, onSelect, headingWords, motion, active }) {
  const navigationId = useId();
  const headingId = `${navigationId}-heading`;
  const instructionsId = `${navigationId}-instructions`;
  const selectorRef = useRef(null);
  const buttons = useRef([]);
  const gesture = useRef(null);
  const suppressClick = useRef(0);
  const lastWheel = useRef(0);
  const wheelDelta = useRef(0);
  const lastWheelAt = useRef(0);
  const focusRequested = useRef(false);
  const [width, setWidth] = useState(320);
  const positions = sectionSelectorPositions(width, selected, crew.length);
  const choose = useCallback((index, focus = false) => {
    const target = ((index % crew.length) + crew.length) % crew.length;
    const activeIsOption = buttons.current.includes(document.activeElement);
    if (target === selected) {
      if (focus) buttons.current[target]?.focus();
      return;
    }
    focusRequested.current = target !== selected && (focus || activeIsOption);
    onSelect(target);
  }, [crew.length, onSelect, selected]);
  useLayoutEffect(() => {
    const element = selectorRef.current;
    const update = () => {
      const nextWidth = element.getBoundingClientRect().width;
      setWidth(current => current === nextWidth ? current : nextWidth);
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    update();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const element = selectorRef.current;
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
    if (focusRequested.current) buttons.current[selected]?.focus();
    focusRequested.current = false;
  }, [selected]);

  return (
    <div className="crew-navigation">
      <h2 className="crew-navigation__heading" id={headingId} aria-label="Pick your character">
        <span aria-hidden="true">Pick your </span>
        <NameCycle entries={headingWords} staticEntry={headingWords[0]} accessibleName="" motion={motion} active={active} />
      </h2>
      <p className="sr-only" id={instructionsId}>Use the mouse wheel or drag horizontally to change sections. With a section button focused, use the left and right arrow keys to move, or Home and End to go to the first and last section.</p>
      <nav
        className="crew-navigation__nav"
        aria-labelledby={headingId}
        aria-describedby={instructionsId}
      >
        <div
          className="character-selector"
          role="group"
          aria-label="Section selector"
          ref={selectorRef}
          style={{ '--selector-stage-height': `${sectionSelectorStageHeight}px` }}
          onKeyDown={event => {
            if (event.isComposing || event.keyCode === 229 || event.altKey || event.metaKey || event.ctrlKey) return;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              const focusedIndex = buttons.current.indexOf(document.activeElement);
              const origin = focusedIndex >= 0 ? focusedIndex : selected;
              choose(origin + (event.key === 'ArrowRight' ? 1 : -1), true);
            } else if (event.key === 'Home') {
              event.preventDefault();
              choose(0, true);
            } else if (event.key === 'End') {
              event.preventDefault();
              choose(crew.length - 1, true);
            }
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
          {crew.map((member, index) => {
            const position = positions[index];
            const destination = sectionLabel(member.section);
            return <button
              key={member.id}
              ref={node => { buttons.current[index] = node; }}
              type="button"
              className="crew-option"
              aria-label={`${destination} section, ${member.name}, ${member.role}`}
              aria-current={index === selected ? 'page' : undefined}
              style={{
                '--selector-left': `${position.left}px`,
                '--selector-width': `${position.width}px`,
                '--selector-arc-y': `${position.arcY}px`,
                '--selector-lift': `${position.lift}px`,
                '--selector-scale': position.scale,
                zIndex: position.selected ? 2 : 1,
              }}
              onClick={event => { if (event.timeStamp >= suppressClick.current) choose(index); }}
            ><strong>{destination}</strong><small>{member.name}</small></button>;
          })}
        </div>
      </nav>
      <span className="crew-navigation__hint" aria-hidden="true">scroll / drag</span>
    </div>
  );
}
