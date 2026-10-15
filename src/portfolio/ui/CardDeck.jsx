import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cardIndexFor, cardIndexOnPage, cardPageIndex, moveCardIndex } from '../domain/card-navigation';
import { cardFanConnections, cardFanLayout } from '../domain/card-fan';
import { signalSeed } from '../domain/decode';
import { accumulateWheelDelta } from '../domain/navigation';
import SignalBands from './SignalBands';
import useSignalBurst from './useSignalBurst';

const sigils = ['[::]', '[<>]', '[//]', '[##]', '[{}]', '[..]'];

function CardFace({ item, visual, meta }) {
  return <>
    {visual && <span className="game-card__visual">{visual}</span>}
    <span className="game-card__sigil" aria-hidden="true">{item.sigil ?? sigils[item.sigilIndex % sigils.length] ?? sigils[0]}</span>
    <span className="game-card__copy">
      <strong className="game-card__title">{item.title}</strong>
      {item.label && <span className="game-card__path">{item.label}</span>}
      {item.description && <span className="game-card__description">{item.description}</span>}
      {meta && !visual && <span className="game-card__meta">{meta}</span>}
    </span>
    {visual
      ? <span className="game-card__visual-footer" aria-hidden="true">
          {meta && <span className="game-card__meta">{meta}</span>}
          <span className="game-card__open">[ open ↗ ]</span>
        </span>
      : <span className="game-card__open" aria-hidden="true">[ open ↗ ]</span>}
  </>;
}

export const GameCard = forwardRef(function GameCard({ item, selected, visual, tabIndex = -1, onFocus, onClick, onPortRef, pose, motion = true }, ref) {
  const meta = Array.isArray(item.meta) ? item.meta.filter(Boolean).join(' · ') : item.meta;
  const signal = useSignalBurst(motion, 320, 8);
  const signalSeedValue = signalSeed(item.id);
  const face = <CardFace item={item} visual={visual} meta={meta} />;
  return <button
    className="game-card"
    type="button"
    ref={ref}
    tabIndex={tabIndex}
    aria-pressed={selected}
    data-selected={selected ? 'true' : 'false'}
    data-compact={pose.height < 180 ? 'true' : undefined}
    style={{ '--fan-x': `${pose.x}px`, '--fan-y': `${pose.y}px`, '--fan-width': `${pose.width}px`, '--fan-height': `${pose.height}px`, '--fan-angle': `${pose.angle}deg`, '--fan-depth': pose.depth }}
    onFocus={event => { signal.start(); onFocus?.(event); }}
    onClick={onClick}
    onMouseEnter={signal.start}
  >
    {face}
    <span className="game-card__port" ref={onPortRef} aria-hidden="true" />
    <span className="game-card__geometry" aria-hidden="true" />
    {motion && signal.tick >= 0 && <SignalBands seed={signalSeedValue} tick={signal.tick} className="game-card__signals">{face}</SignalBands>}
  </button>;
});

const sameLayout = (first, second) => first.count === second.count
  && first.anchor === second.anchor
  && first.cardWidth === second.cardWidth
  && first.cardHeight === second.cardHeight
  && first.poses.length === second.poses.length
  && first.poses.every((pose, index) => pose.x === second.poses[index].x && pose.y === second.poses[index].y && pose.angle === second.poses[index].angle);

const CardDeck = forwardRef(function CardDeck({ items = [], selectedId, onSelect, onActivate, label = 'Items', renderVisual, motion = true, hubRef }, forwardedRef) {
  const deckRef = useRef(null);
  const fanRef = useRef(null);
  const buttons = useRef(new Map());
  const ports = useRef(new Map());
  const localHubRef = useRef(null);
  const wheelTotal = useRef(0);
  const lastWheelAt = useRef(0);
  const lastWheelPageAt = useRef(Number.NEGATIVE_INFINITY);
  const touchStart = useRef(null);
  const suppressClick = useRef(false);
  const suppressTimer = useRef(0);
  const focusFrame = useRef(0);
  const [layout, setLayout] = useState(() => cardFanLayout(0, 0, false, 1));
  const [connections, setConnections] = useState([]);
  const capacity = layout.count;
  const activeIndex = cardIndexFor(items, selectedId);
  const pageIndex = activeIndex < 0 ? 0 : cardPageIndex(activeIndex, capacity, items.length);
  const pageCount = Math.max(1, Math.ceil(items.length / capacity));
  const hasVisual = Boolean(renderVisual || items.some(item => item.visual));
  const visibleItems = useMemo(() => items.slice(pageIndex * capacity, pageIndex * capacity + capacity), [capacity, items, pageIndex]);

  const focusSelected = useCallback(() => {
    if (!deckRef.current?.isConnected || deckRef.current.closest('[hidden],[inert]')) return;
    const index = cardIndexFor(items, selectedId);
    if (index < 0) return;
    buttons.current.get(items[index].id)?.focus();
  }, [items, selectedId]);

  useImperativeHandle(forwardedRef, () => ({ focusSelected }), [focusSelected]);

  const measureLayout = useCallback(() => {
    const deck = deckRef.current;
    const fan = fanRef.current;
    if (!deck || !fan) return;
    const box = fan.getBoundingClientRect();
    const hub = (hubRef ?? localHubRef).current;
    const hubBox = hub?.isConnected && !hub.closest('[hidden],[inert]') ? hub.getBoundingClientRect() : null;
    const anchor = hubBox && hubBox.bottom <= box.top + 10 ? 'above' : 'side';
    // Keep capacity independent of whether the pager is currently rendered.
    const next = cardFanLayout(box.width, box.height, hasVisual, items.length, Math.max(0, deck.clientHeight - 48), anchor);
    setLayout(current => sameLayout(current, next) ? current : next);
  }, [hasVisual, hubRef, items.length]);

  useLayoutEffect(() => {
    measureLayout();
    const deck = deckRef.current;
    const fan = fanRef.current;
    if (!deck || !fan) return undefined;
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measureLayout);
      return () => window.removeEventListener('resize', measureLayout);
    }
    const observer = new ResizeObserver(measureLayout);
    observer.observe(deck);
    observer.observe(fan);
    const hub = (hubRef ?? localHubRef).current;
    const wheel = hub?.closest('.crew-wheel');
    if (wheel) observer.observe(wheel);
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measureLayout);
    };
    window.addEventListener('resize', onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
    };
  }, [hubRef, measureLayout]);

  useLayoutEffect(() => {
    const fan = fanRef.current;
    if (!fan) return undefined;
    const resolvedHubRef = hubRef ?? localHubRef;
    const measureConnections = () => {
      const hub = resolvedHubRef.current;
      if (!hub?.isConnected || hub.closest('[hidden],[inert]')) {
        setConnections(current => current.length ? [] : current);
        return;
      }
      const fanBox = fan.getBoundingClientRect();
      const hubBox = hub.getBoundingClientRect();
      const portsInFan = visibleItems.flatMap(item => {
        const element = ports.current.get(item.id);
        if (!element?.isConnected) return [];
        const box = element.getBoundingClientRect();
        return [{ id: item.id, x: box.left + box.width / 2 - fanBox.left, y: box.top + box.height / 2 - fanBox.top }];
      });
      const next = cardFanConnections({ x: hubBox.left + hubBox.width / 2 - fanBox.left, y: hubBox.top + hubBox.height / 2 - fanBox.top }, portsInFan);
      const key = segments => segments.map(link => `${link.x.toFixed(1)},${link.y.toFixed(1)},${link.length.toFixed(1)},${link.angle.toFixed(1)},${link.kind},${link.itemId ?? ''}`).join('|');
      const nextKey = key(next);
      setConnections(current => key(current) === nextKey ? current : next);
    };
    measureConnections();
    if (typeof ResizeObserver === 'undefined') {
      let frame = 0;
      const onResize = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(measureConnections);
      };
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(frame);
      };
    }
    const observer = new ResizeObserver(measureConnections);
    observer.observe(fan);
    const hub = resolvedHubRef.current;
    if (hub?.isConnected) {
      observer.observe(hub);
      const wheel = hub.closest('.crew-wheel');
      if (wheel) observer.observe(wheel);
    }
    visibleItems.forEach(item => {
      const port = ports.current.get(item.id);
      if (port) observer.observe(port);
    });
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measureConnections);
    };
    window.addEventListener('resize', onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
    };
  }, [hubRef, layout, pageIndex, selectedId, visibleItems]);

  useEffect(() => () => {
    cancelAnimationFrame(focusFrame.current);
    clearTimeout(suppressTimer.current);
  }, []);

  const focusIndex = useCallback(index => {
    const safeIndex = Math.max(0, Math.min(items.length - 1, index));
    const item = items[safeIndex];
    if (!item) return;
    onSelect?.(item.id);
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      if (!deckRef.current?.isConnected || deckRef.current.closest('[hidden],[inert]')) return;
      buttons.current.get(item.id)?.focus();
    });
  }, [items, onSelect]);

  const setPage = useCallback(direction => {
    if (pageCount < 2) return;
    const target = Math.max(0, Math.min(pageCount - 1, pageIndex + direction));
    if (target === pageIndex) return;
    focusIndex(cardIndexOnPage(target, capacity, items.length));
  }, [capacity, focusIndex, items.length, pageCount, pageIndex]);

  useEffect(() => {
    const node = deckRef.current;
    if (!node) return undefined;
    const handleWheel = event => {
      if (pageCount < 2 || event.ctrlKey || !event.deltaY || node.closest('[hidden],[inert]')) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastWheelAt.current > 180) wheelTotal.current = 0;
      lastWheelAt.current = now;
      const { total, direction, ready } = accumulateWheelDelta(wheelTotal.current, event.deltaY, 72);
      wheelTotal.current = total;
      if (!ready || now - lastWheelPageAt.current < 240) return;
      lastWheelPageAt.current = now;
      wheelTotal.current = 0;
      setPage(direction);
    };
    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
  }, [pageCount, setPage]);

  const handleKeyDown = event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    const index = cardIndexFor(items, selectedId);
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
      focusIndex(moveCardIndex(index, direction, items.length));
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusIndex(items.length - 1);
    } else if (event.key === 'PageDown') {
      event.preventDefault();
      setPage(1);
    } else if (event.key === 'PageUp') {
      event.preventDefault();
      setPage(-1);
    }
  };

  const handleTouchStart = event => {
    suppressClick.current = false;
    clearTimeout(suppressTimer.current);
    touchStart.current = event.touches[0]?.clientY ?? null;
  };
  const handleTouchEnd = event => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - (event.changedTouches[0]?.clientY ?? touchStart.current);
    touchStart.current = null;
    if (Math.abs(delta) > 44) {
      suppressClick.current = true;
      clearTimeout(suppressTimer.current);
      suppressTimer.current = window.setTimeout(() => { suppressClick.current = false; }, 450);
      setPage(delta > 0 ? 1 : -1);
    }
  };
  const handleTouchCancel = () => {
    touchStart.current = null;
    suppressClick.current = false;
    clearTimeout(suppressTimer.current);
  };

  return <section className="card-deck" ref={deckRef} data-visual={hasVisual} data-fan-count={layout.count} data-motion={motion} aria-label={label} onKeyDown={handleKeyDown} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel} onClickCapture={event => {
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
    clearTimeout(suppressTimer.current);
  }}>
    <div className="card-deck__fan" ref={fanRef} role="group" aria-label={label}>
      <div className="card-deck__links" aria-hidden="true">
        {connections.map((link, index) => <span
          className="card-deck__link"
          key={`${link.kind}-${link.itemId ?? 'hub'}-${index}`}
          data-kind={link.kind}
          data-selected={link.itemId === selectedId ? 'true' : 'false'}
          style={{ left: `${link.x}px`, top: `${link.y}px`, width: `${link.length}px`, transform: `rotate(${link.angle}deg)`, '--wire-length': `${Math.max(0, link.length - 7)}px`, '--wire-delay': `${index * -0.22}s` }}
        />)}
      </div>
      {visibleItems.map((item, localIndex) => {
        const selected = item.id === items[activeIndex]?.id;
        const tabIndex = selected ? 0 : -1;
        const visual = renderVisual ? renderVisual(item) : item.visual;
        return <GameCard
          key={item.id}
          item={{ ...item, sigilIndex: pageIndex * capacity + localIndex }}
          selected={selected}
          visual={visual}
          pose={{ ...layout.poses[localIndex], width: layout.cardWidth, height: layout.cardHeight }}
          motion={motion}
          tabIndex={tabIndex}
          ref={node => { if (node) buttons.current.set(item.id, node); else buttons.current.delete(item.id); }}
          onPortRef={node => { if (node) ports.current.set(item.id, node); else ports.current.delete(item.id); }}
          onFocus={() => { if (item.id !== selectedId) onSelect?.(item.id); }}
          onClick={() => { onSelect?.(item.id); onActivate?.(item.id); }}
        />;
      })}
    </div>
    {pageCount > 1 && <nav className="card-deck__paging" aria-label={`${label} pages`}>
      <button type="button" disabled={pageIndex <= 0} onClick={() => setPage(-1)}>← previous set</button>
      <span aria-live="polite">{pageIndex + 1} / {pageCount}</span>
      <button type="button" disabled={pageIndex >= pageCount - 1} onClick={() => setPage(1)}>next set →</button>
    </nav>}
    <p className="card-deck__hint">Select a card · arrows move · Enter opens · Esc returns</p>
  </section>;
});

export default CardDeck;
