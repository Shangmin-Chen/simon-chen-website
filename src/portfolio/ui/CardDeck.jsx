import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { cardIndexFor, cardIndexOnPage, cardPageIndex, moveCardIndex } from '../domain/card-navigation';
import { accumulateWheelDelta } from '../domain/navigation';

const sigils = ['[::]', '[<>]', '[//]', '[##]', '[{}]', '[..]'];

export const GameCard = forwardRef(function GameCard({ item, selected, visual, tabIndex = -1, onFocus, onClick }, ref) {
  const meta = Array.isArray(item.meta) ? item.meta.filter(Boolean).join(' · ') : item.meta;
  return <button
    className="game-card"
    type="button"
    ref={ref}
    tabIndex={tabIndex}
    aria-pressed={selected}
    data-selected={selected ? 'true' : 'false'}
    onFocus={onFocus}
    onClick={onClick}
  >
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
  </button>;
});

const CardDeck = forwardRef(function CardDeck({ items = [], selectedId, onSelect, onActivate, label = 'Items', renderVisual }, forwardedRef) {
  const deckRef = useRef(null);
  const buttons = useRef(new Map());
  const wheelTotal = useRef(0);
  const lastWheelAt = useRef(0);
  const lastWheelPageAt = useRef(Number.NEGATIVE_INFINITY);
  const touchStart = useRef(null);
  const suppressClick = useRef(false);
  const suppressTimer = useRef(0);
  const focusFrame = useRef(0);
  const [layout, setLayout] = useState({ columns: 2, rows: 2 });
  const capacity = layout.columns * layout.rows;
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

  const measure = useCallback(node => {
    if (!node) return;
    const width = node.clientWidth;
    const height = node.clientHeight;
    const next = { columns: width >= 600 ? 3 : width >= 280 ? 2 : 1, rows: height >= (hasVisual ? 470 : 400) ? 2 : 1 };
    setLayout(current => current.columns === next.columns && current.rows === next.rows ? current : next);
  }, [hasVisual]);

  useEffect(() => {
    const node = deckRef.current;
    if (!node) return undefined;
    measure(node);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => measure(node));
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasVisual, measure]);

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
      const distance = event.key === 'ArrowRight' || event.key === 'ArrowLeft' ? 1 : layout.columns;
      focusIndex(moveCardIndex(index, direction * distance, items.length));
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

  return <section className="card-deck" ref={deckRef} data-visual={hasVisual} style={{ '--card-columns': layout.columns, '--card-rows': layout.rows }} aria-label={label} onKeyDown={handleKeyDown} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel} onClickCapture={event => {
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
    clearTimeout(suppressTimer.current);
  }}>
    <div className="card-deck__grid" role="group" aria-label={label}>
      {visibleItems.map((item, localIndex) => {
        const selected = item.id === items[activeIndex]?.id;
        const tabIndex = selected ? 0 : -1;
        const visual = renderVisual ? renderVisual(item) : item.visual;
        return <GameCard
          key={item.id}
          item={{ ...item, sigilIndex: pageIndex * capacity + localIndex }}
          selected={selected}
          visual={visual}
          tabIndex={tabIndex}
          ref={node => { if (node) buttons.current.set(item.id, node); else buttons.current.delete(item.id); }}
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
