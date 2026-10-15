import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cardIndexFor, cardIndexOnPage, cardPageIndex, moveInventoryIndex } from '../domain/card-navigation';
import { inventoryLayout } from '../domain/inventory-layout';
import { accumulateWheelDelta } from '../domain/navigation';
import InventoryFrame from './InventoryFrame';
import InventoryPreview from './InventoryPreview';
import InventorySlot from './InventorySlot';

const CardDeck = forwardRef(function CardDeck({ items = [], selectedId, onSelect, onActivate, label = 'Items', renderVisual, motion = true }, forwardedRef) {
  const deckRef = useRef(null);
  const layoutCacheRef = useRef(null);
  const buttons = useRef(new Map());
  const wheelTotal = useRef(0);
  const lastWheelAt = useRef(0);
  const lastWheelPageAt = useRef(Number.NEGATIVE_INFINITY);
  const touchStart = useRef(null);
  const suppressClick = useRef(false);
  const suppressTimer = useRef(0);
  const focusFrame = useRef(0);
  const [layout, setLayout] = useState(() => inventoryLayout(0, 0, 1));
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  const activeIndex = cardIndexFor(items, selectedId);
  const pageIndex = activeIndex < 0 ? 0 : cardPageIndex(activeIndex, layout.capacity, items.length);
  const pageCount = Math.max(1, Math.ceil(items.length / layout.capacity));
  const visibleItems = useMemo(() => items.slice(pageIndex * layout.capacity, (pageIndex + 1) * layout.capacity), [items, layout.capacity, pageIndex]);
  const previewItem = items[activeIndex] ?? items[0];
  const previewVisual = previewItem ? (renderVisual ? renderVisual(previewItem) : previewItem.visual) : null;

  const focusSelected = useCallback(() => {
    const deck = deckRef.current;
    if (!deck?.isConnected || deck.closest('[hidden],[inert]')) return;
    const index = cardIndexFor(items, selectedId);
    if (index < 0) return;
    buttons.current.get(items[index].id)?.focus();
  }, [items, selectedId]);

  useImperativeHandle(forwardedRef, () => ({ focusSelected }), [focusSelected]);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  const measureLayout = useCallback(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const next = inventoryLayout(deck.clientWidth, deck.clientHeight, items.length || 1);
    const current = layoutCacheRef.current;
    if (current?.wide === next.wide && current.showPreview === next.showPreview && current.columns === next.columns && current.rows === next.rows && current.capacity === next.capacity && current.previewHeight === next.previewHeight && current.slotHeight === next.slotHeight) return;
    layoutCacheRef.current = next;
    setLayout(next);
  }, [items.length]);

  useLayoutEffect(() => {
    measureLayout();
    const deck = deckRef.current;
    if (!deck) return undefined;
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measureLayout);
      return () => window.removeEventListener('resize', measureLayout);
    }
    const observer = new ResizeObserver(measureLayout);
    observer.observe(deck);
    return () => observer.disconnect();
  }, [measureLayout]);

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
    focusIndex(cardIndexOnPage(target, layout.capacity, items.length));
  }, [focusIndex, items.length, layout.capacity, pageCount, pageIndex]);

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
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const direction = event.key.slice(5).toLowerCase();
      focusIndex(moveInventoryIndex(index, direction, layout.columns, items.length));
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
  const activateSelected = () => {
    if (!previewItem) return;
    onSelect?.(previewItem.id);
    onActivate?.(previewItem.id);
  };

  const compactPreview = layout.wide ? layout.availableHeight < 130 : layout.previewHeight < 130;

  return <section className="card-deck" ref={deckRef} data-layout={layout.wide ? 'wide' : 'stacked'} data-show-preview={layout.showPreview ? 'true' : 'false'} data-preview-compact={compactPreview ? 'true' : 'false'} data-motion={motion} data-page-visible={pageVisible ? 'true' : 'false'} aria-label={label} onKeyDown={handleKeyDown} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel} onClickCapture={event => {
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
    clearTimeout(suppressTimer.current);
  }}>
    <InventoryFrame key={`${label}:${pageIndex}`} motion={motion}>
      <header className="inventory-frame__header">
        <h2>{label.toUpperCase()}</h2>
        <span>{String(items.length).padStart(2, '0')} ITEMS</span>
      </header>
      <div className="inventory-layout" data-layout={layout.wide ? 'wide' : 'stacked'} data-show-preview={layout.showPreview ? 'true' : 'false'} data-preview-compact={compactPreview ? 'true' : 'false'} style={{ '--inventory-columns': layout.columns, '--inventory-rows': layout.rows, '--inventory-slot-height': `${layout.slotHeight}px`, '--inventory-preview-height': `${layout.previewHeight}px` }}>
        <div className="inventory-rack" role="group" aria-label={`${label} inventory`}>
          <div className="inventory-slots" style={{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${Math.max(1, Math.min(layout.rows, Math.ceil(visibleItems.length / layout.columns)))}, var(--inventory-slot-height))` }}>
          {visibleItems.map((item, localIndex) => {
            const index = pageIndex * layout.capacity + localIndex;
            const visual = renderVisual ? renderVisual(item) : item.visual;
            return <InventorySlot
              key={item.id}
              item={item}
              index={index}
              selected={item.id === previewItem?.id}
              visual={visual}
              tabIndex={item.id === previewItem?.id ? 0 : -1}
              motion={motion}
              entryIndex={localIndex}
              onFocus={() => { if (item.id !== selectedId) onSelect?.(item.id); }}
              onClick={() => { onSelect?.(item.id); onActivate?.(item.id); }}
              onMouseEnter={() => { if (item.id !== selectedId) onSelect?.(item.id); }}
              ref={node => { if (node) buttons.current.set(item.id, node); else buttons.current.delete(item.id); }}
            />;
          })}
          </div>
        </div>
        {layout.showPreview && <div className="inventory-preview-wrap">
          <InventoryPreview item={previewItem} index={Math.max(0, activeIndex)} count={items.length} visual={previewVisual} motion={motion} />
        </div>}
      </div>
      <footer className="inventory-frame__footer">
        <div className="inventory-frame__controls">
          {pageCount > 1 && <nav className="card-deck__paging" aria-label={`${label} pages`}>
            <button type="button" disabled={pageIndex <= 0} onClick={() => setPage(-1)}>← PREV</button>
            <span aria-live="polite">{String(pageIndex + 1).padStart(2, '0')} / {String(pageCount).padStart(2, '0')}</span>
            <button type="button" disabled={pageIndex >= pageCount - 1} onClick={() => setPage(1)}>NEXT →</button>
          </nav>}
          {layout.showPreview && previewItem && <button className="inventory-frame__open" type="button" onClick={activateSelected} aria-label={`Open ${previewItem.title}`}>
            OPEN ITEM <span aria-hidden="true">↗</span>
          </button>}
        </div>
        <p className="card-deck__hint"><span>↑ ↓ SELECT</span><span>ENTER OPEN</span><span>ESC BACK</span></p>
      </footer>
    </InventoryFrame>
  </section>;
});

export default CardDeck;
