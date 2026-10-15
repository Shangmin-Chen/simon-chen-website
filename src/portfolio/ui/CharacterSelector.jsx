import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { accumulateWheelDelta, sectionSelectorPositions, sectionSelectorStageHeight } from '../domain/navigation';
import NameCycle from './NameCycle';
import useSelectorPhase from './useSelectorPhase';

const sectionLabel = section => `${section[0].toUpperCase()}${section.slice(1)}`;

const CharacterSelector = forwardRef(function CharacterSelector({ crew, selected, onSelect, headingWords, motion, active }, forwardedRef) {
  const navigationId = useId();
  const headingId = `${navigationId}-heading`;
  const instructionsId = `${navigationId}-instructions`;
  const selectorRef = useRef(null);
  const buttons = useRef([]);
  const gesture = useRef(null);
  const suppressClickUntil = useRef(0);
  const lastWheel = useRef(0);
  const wheelDelta = useRef(0);
  const lastWheelAt = useRef(0);
  const [width, setWidth] = useState(320);
  const { phase, moveBy, moveTo } = useSelectorPhase(selected, crew.length, motion && active);
  const positions = sectionSelectorPositions(width, phase, crew.length);
  const chooseTo = useCallback((index, focus = false) => {
    const target = moveTo(index);
    if (target === selected) {
      if (focus) buttons.current[target]?.focus();
      return;
    }
    onSelect(target);
  }, [moveTo, onSelect, selected]);
  const chooseBy = useCallback((steps, focus = false) => {
    const target = moveBy(steps);
    if (target === selected) {
      if (focus) buttons.current[target]?.focus();
      return;
    }
    onSelect(target);
  }, [moveBy, onSelect, selected]);
  const focusSelected = useCallback(() => buttons.current[selected]?.focus(), [selected]);
  useImperativeHandle(forwardedRef, () => ({ focusSelected }), [focusSelected]);
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
      chooseBy(accumulated.direction);
    };
    element.addEventListener('wheel', scroll, { passive: false });
    return () => element.removeEventListener('wheel', scroll);
  }, [chooseBy]);
  useEffect(() => {
    if (buttons.current.includes(document.activeElement)) buttons.current[selected]?.focus();
  }, [selected]);

  return (
    <div className="crew-navigation">
      <h2 className="crew-navigation__heading" id={headingId} aria-label="Pick your character">
        <span aria-hidden="true">Pick your </span>
        <NameCycle entries={headingWords} staticEntry={headingWords[0]} accessibleName="" motion={motion} active={active} />
      </h2>
      <p className="sr-only" id={instructionsId}>Use the mouse wheel or drag horizontally to rotate through sections. Tab focuses the current section; with it focused, Left and Right loop through sections, and Home and End choose the first and last section.</p>
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
            if (!event.target.closest('.crew-option')) return;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              const focusedIndex = buttons.current.indexOf(document.activeElement);
              if (focusedIndex >= 0) chooseTo(focusedIndex + (event.key === 'ArrowRight' ? 1 : -1), true);
            } else if (event.key === 'Home') {
              event.preventDefault();
              chooseTo(0, true);
            } else if (event.key === 'End') {
              event.preventDefault();
              chooseTo(crew.length - 1, true);
            }
          }}
          onPointerDown={event => {
            if (event.button === 0) {
              suppressClickUntil.current = 0;
              gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, appliedSteps: 0, captured: false, dragged: false };
            }
          }}
          onPointerMove={event => {
            const drag = gesture.current;
            if (!drag || drag.id !== event.pointerId) return;
            const dx = event.clientX - drag.x;
            const dy = event.clientY - drag.y;
            if (!drag.captured && Math.abs(dy) > Math.abs(dx)) { gesture.current = null; return; }
            const totalSteps = Math.trunc(-dx / 36);
            const nextSteps = totalSteps - drag.appliedSteps;
            if (!nextSteps) return;
            if (!drag.captured) {
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.captured = true;
            }
            drag.appliedSteps = totalSteps;
            drag.dragged = true;
            suppressClickUntil.current = event.timeStamp + 500;
            chooseBy(nextSteps);
          }}
          onPointerUp={event => {
            if (gesture.current?.id === event.pointerId && gesture.current.dragged) suppressClickUntil.current = event.timeStamp + 500;
            gesture.current = null;
          }}
          onPointerCancel={event => {
            if (gesture.current?.id === event.pointerId) gesture.current = null;
          }}
          onLostPointerCapture={event => {
            if (gesture.current?.id !== event.pointerId) return;
            if (gesture.current.dragged) suppressClickUntil.current = event.timeStamp + 500;
            gesture.current = null;
          }}
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
              tabIndex={index === selected ? 0 : -1}
              style={{
                '--selector-left': `${position.left}px`,
                '--selector-width': `${position.width}px`,
                '--selector-arc-y': `${position.arcY}px`,
                '--selector-lift': `${position.lift}px`,
                '--selector-scale': position.scale,
                '--selector-opacity': position.opacity,
                '--selector-front': `${position.front * 100}%`,
                '--selector-depth': position.depth,
                pointerEvents: position.opacity < 0.1 ? 'none' : undefined,
              }}
              onClick={event => { if (event.timeStamp >= suppressClickUntil.current) chooseTo(index); }}
            ><strong>{destination}</strong><small>{member.name}</small></button>;
          })}
        </div>
      </nav>
      <span className="crew-navigation__hint" aria-hidden="true">scroll / drag</span>
    </div>
  );
});

export default CharacterSelector;
