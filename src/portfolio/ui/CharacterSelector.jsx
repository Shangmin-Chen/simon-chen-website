import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { accumulateWheelDelta, sectionSelectorPositions, sectionSelectorStageHeight } from '../domain/navigation';
import useSelectorPhase from './useSelectorPhase';

const sectionLabel = section => `${section[0].toUpperCase()}${section.slice(1)}`;

const CharacterSelector = forwardRef(function CharacterSelector({ crew, selected, onSelect, onEnterSection, motion, active }, forwardedRef) {
  const navigationId = useId();
  const headingId = `${navigationId}-heading`;
  const instructionsId = `${navigationId}-instructions`;
  const selectorRef = useRef(null);
  const buttons = useRef([]);
  const gesture = useRef(null);
  const suppressClickUntil = useRef(0);
  const wheelDelta = useRef(0);
  const lastWheelAt = useRef(0);
  const wheelTimer = useRef(0);
  const selectedRef = useRef(selected);
  const previousSelected = useRef(selected);
  const onSelectRef = useRef(onSelect);
  const wheelInterruptionCleanup = useRef(null);
  const [width, setWidth] = useState(320);
  const { phase, moveTo, previewBy, commitPreview, cancelPreview } = useSelectorPhase(selected, crew.length, motion && active);
  const positions = sectionSelectorPositions(width, phase, crew.length);
  const chooseTo = useCallback((index, focus = false) => {
    const target = moveTo(index);
    if (target === selected) {
      if (focus) buttons.current[target]?.focus();
      return;
    }
    onSelect(target);
  }, [moveTo, onSelect, selected]);
  const removeWheelInterruptionListeners = useCallback(() => {
    wheelInterruptionCleanup.current?.();
    wheelInterruptionCleanup.current = null;
  }, []);
  const finishWheelPreview = useCallback(() => {
    window.clearTimeout(wheelTimer.current);
    wheelTimer.current = 0;
    wheelDelta.current = 0;
    removeWheelInterruptionListeners();
    const target = commitPreview();
    if (target !== selectedRef.current) onSelectRef.current(target);
  }, [commitPreview, removeWheelInterruptionListeners]);
  const cancelWheelPreview = useCallback(() => {
    window.clearTimeout(wheelTimer.current);
    wheelTimer.current = 0;
    wheelDelta.current = 0;
    removeWheelInterruptionListeners();
    cancelPreview();
  }, [cancelPreview, removeWheelInterruptionListeners]);
  const watchWheelPreview = useCallback(() => {
    if (wheelInterruptionCleanup.current) return;
    const selector = selectorRef.current;
    const cancelOnKeyboard = () => {
      if (wheelTimer.current) cancelWheelPreview();
    };
    const cancelOutsideSelector = event => {
      if (wheelTimer.current && !selector?.contains(event.target)) cancelWheelPreview();
    };
    document.addEventListener('keydown', cancelOnKeyboard);
    document.addEventListener('focusin', cancelOutsideSelector);
    document.addEventListener('pointerdown', cancelOutsideSelector);
    wheelInterruptionCleanup.current = () => {
      document.removeEventListener('keydown', cancelOnKeyboard);
      document.removeEventListener('focusin', cancelOutsideSelector);
      document.removeEventListener('pointerdown', cancelOutsideSelector);
    };
  }, [cancelWheelPreview]);
  const focusSelected = useCallback(() => buttons.current[selected]?.focus(), [selected]);
  useImperativeHandle(forwardedRef, () => ({ focusSelected }), [focusSelected]);
  useLayoutEffect(() => {
    selectedRef.current = selected;
    onSelectRef.current = onSelect;
  }, [onSelect, selected]);
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
      if (!accumulated.ready) return;
      wheelDelta.current = 0;
      buttons.current[selected]?.focus({ preventScroll: true });
      previewBy(accumulated.direction);
      watchWheelPreview();
      window.clearTimeout(wheelTimer.current);
      wheelTimer.current = window.setTimeout(finishWheelPreview, 360);
    };
    element.addEventListener('wheel', scroll, { passive: false });
    return () => element.removeEventListener('wheel', scroll);
  }, [finishWheelPreview, previewBy, selected, watchWheelPreview]);
  useEffect(() => () => {
    window.clearTimeout(wheelTimer.current);
    removeWheelInterruptionListeners();
  }, [removeWheelInterruptionListeners]);
  useEffect(() => {
    if (previousSelected.current === selected) return;
    previousSelected.current = selected;
    cancelWheelPreview();
  }, [cancelWheelPreview, selected]);
  useEffect(() => {
    if (!active || !motion) cancelWheelPreview();
  }, [active, cancelWheelPreview, motion]);
  useEffect(() => {
    if (buttons.current.includes(document.activeElement)) buttons.current[selected]?.focus();
  }, [selected]);

  return (
    <div className="crew-navigation">
      <h2 className="crew-navigation__heading" id={headingId} aria-label="Pick your character">
        Pick your character
      </h2>
      <p className="sr-only" id={instructionsId}>Use the mouse wheel or drag horizontally to rotate through sections. Tab focuses the current section; with it focused, Left and Right loop through sections, Home and End choose the first and last section, Enter or Space opens the current section&apos;s inventory, and Down moves to that inventory.</p>
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
              if (focusedIndex >= 0) {
                cancelWheelPreview();
                chooseTo(focusedIndex + (event.key === 'ArrowRight' ? 1 : -1), true);
              }
            } else if (event.key === 'ArrowDown') {
              const focusedIndex = buttons.current.indexOf(document.activeElement);
              if (focusedIndex === selected) {
                event.preventDefault();
                cancelWheelPreview();
                onEnterSection?.();
              }
            } else if (event.key === 'Home') {
              event.preventDefault();
              cancelWheelPreview();
              chooseTo(0, true);
            } else if (event.key === 'End') {
              event.preventDefault();
              cancelWheelPreview();
              chooseTo(crew.length - 1, true);
            }
          }}
          onPointerDown={event => {
            if (event.button === 0) {
              cancelWheelPreview();
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
              buttons.current[selected]?.focus({ preventScroll: true });
            }
            drag.appliedSteps = totalSteps;
            drag.dragged = true;
            suppressClickUntil.current = event.timeStamp + 500;
            previewBy(nextSteps);
          }}
          onPointerUp={event => {
            if (gesture.current?.id === event.pointerId && gesture.current.dragged) {
              suppressClickUntil.current = event.timeStamp + 500;
              const target = commitPreview();
              if (target !== selected) onSelect(target);
            }
            gesture.current = null;
          }}
          onPointerCancel={event => {
            if (gesture.current?.id === event.pointerId) {
              cancelPreview();
              gesture.current = null;
            }
          }}
          onLostPointerCapture={event => {
            if (gesture.current?.id !== event.pointerId) return;
            if (gesture.current.dragged) {
              suppressClickUntil.current = event.timeStamp + 500;
              cancelPreview();
            }
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
              onClick={event => {
                if (event.timeStamp < suppressClickUntil.current) return;
                cancelWheelPreview();
                if (event.detail === 0 && index === selected) onEnterSection?.();
                else chooseTo(index);
              }}
            ><strong>{destination}</strong><small>{member.name}</small></button>;
          })}
        </div>
      </nav>
      <span className="crew-navigation__hint" aria-hidden="true">scroll / drag</span>
    </div>
  );
});

export default CharacterSelector;
