import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { cardIndexFor, moveInventoryIndex } from '../domain/card-navigation';
import { inventoryLayout } from '../domain/inventory-layout';
import InventoryFrame from './InventoryFrame';
import InventorySlot from './InventorySlot';

function revealInventoryButton(button) {
  if (!button) return;
  const rack = button.closest('.inventory-rack');
  if (!rack) return;
  const buttonRect = button.getBoundingClientRect();
  const rackRect = rack.getBoundingClientRect();
  const visibleTop = rackRect.top + rack.clientTop;
  const visibleBottom = visibleTop + rack.clientHeight;
  if (buttonRect.top < visibleTop) rack.scrollTop -= visibleTop - buttonRect.top;
  else if (buttonRect.bottom > visibleBottom) rack.scrollTop += buttonRect.bottom - visibleBottom;
}

function focusInventoryButton(button) {
  if (!button) return;
  button.focus({ preventScroll: true });
  revealInventoryButton(button);
}

const CardDeck = forwardRef(function CardDeck({ items = [], selectedId, onSelect, onActivate, label = 'Items', renderVisual, motion = true }, forwardedRef) {
  const deckRef = useRef(null);
  const rackRef = useRef(null);
  const layoutCacheRef = useRef(null);
  const buttons = useRef(new Map());
  const focusFrame = useRef(0);
  const lastBoundsRef = useRef(null);
  const initialRevealRef = useRef(false);
  const pendingResizeRevealRef = useRef(false);
  const [layout, setLayout] = useState(() => inventoryLayout(0, 0, items.length));
  const [documentVisible, setDocumentVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  const activeIndex = cardIndexFor(items, selectedId);

  const focusSelected = useCallback(() => {
    const deck = deckRef.current;
    if (!deck?.isConnected || deck.closest('[hidden],[inert]')) return;
    const index = cardIndexFor(items, selectedId);
    if (index < 0) return;
    focusInventoryButton(buttons.current.get(items[index].id));
  }, [items, selectedId]);

  useImperativeHandle(forwardedRef, () => ({ focusSelected }), [focusSelected]);

  useEffect(() => {
    const updateVisibility = () => setDocumentVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  const measureLayout = useCallback(() => {
    const rack = rackRef.current;
    if (!rack) return;
    const style = window.getComputedStyle(rack);
    const bounds = {
      width: Math.max(0, rack.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight)),
      height: Math.max(0, rack.clientHeight - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom)),
    };
    const previousBounds = lastBoundsRef.current;
    if (previousBounds && (previousBounds.width !== bounds.width || previousBounds.height !== bounds.height)) {
      pendingResizeRevealRef.current = true;
    }
    lastBoundsRef.current = bounds;
    const next = inventoryLayout(bounds.width, bounds.height, items.length);
    const current = layoutCacheRef.current;
    if (current?.width === next.width && current.height === next.height && current.columns === next.columns && current.minimumSlotWidth === next.minimumSlotWidth && current.minimumSlotHeight === next.minimumSlotHeight) return;
    layoutCacheRef.current = next;
    setLayout(next);
  }, [items.length]);

  useLayoutEffect(() => {
    measureLayout();
    const rack = rackRef.current;
    if (!rack) return undefined;
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measureLayout);
      return () => window.removeEventListener('resize', measureLayout);
    }
    const observer = new ResizeObserver(measureLayout);
    observer.observe(rack);
    return () => observer.disconnect();
  }, [measureLayout]);

  useLayoutEffect(() => {
    const deck = deckRef.current;
    if (!deck?.isConnected || deck.closest('[hidden],[inert]') || !documentVisible || !items.length) return;
    const measured = layoutCacheRef.current;
    if (!measured || measured.width !== layout.width || measured.height !== layout.height) return;
    if (!initialRevealRef.current) {
      const index = cardIndexFor(items, selectedId);
      const button = index < 0 ? null : buttons.current.get(items[index].id);
      if (!button) return;
      revealInventoryButton(button);
      initialRevealRef.current = true;
      pendingResizeRevealRef.current = false;
      return;
    }
    if (!pendingResizeRevealRef.current) return;
    pendingResizeRevealRef.current = false;
    const index = cardIndexFor(items, selectedId);
    if (index >= 0) revealInventoryButton(buttons.current.get(items[index].id));
  }, [items, selectedId, layout, documentVisible]);

  useEffect(() => () => {
    cancelAnimationFrame(focusFrame.current);
  }, []);

  const focusIndex = useCallback(index => {
    const safeIndex = Math.max(0, Math.min(items.length - 1, index));
    const item = items[safeIndex];
    if (!item) return;
    onSelect?.(item.id);
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      if (!deckRef.current?.isConnected || deckRef.current.closest('[hidden],[inert]')) return;
      focusInventoryButton(buttons.current.get(item.id));
    });
  }, [items, onSelect]);

  const handleKeyDown = event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    const focusedSlot = event.target.closest('[data-inventory-index]');
    const focusedIndex = focusedSlot && event.currentTarget.contains(focusedSlot) ? Number(focusedSlot.dataset.inventoryIndex) : -1;
    const index = Number.isInteger(focusedIndex) && focusedIndex >= 0 ? focusedIndex : cardIndexFor(items, selectedId);
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
    }
  };

  return <section className="card-deck" ref={deckRef} data-columns={layout.columns} data-motion={motion} data-document-visible={documentVisible ? 'true' : 'false'} aria-label={label} onKeyDown={handleKeyDown}>
    <InventoryFrame motion={motion}>
      <header className="inventory-frame__header">
        <h2>{label.toUpperCase()}</h2>
        <span>{String(items.length).padStart(2, '0')} ITEMS</span>
      </header>
      <div className="inventory-rack" ref={rackRef} role="group" aria-label={`${label} inventory`}>
        <div className="inventory-slots" style={{ '--inventory-slot-min-width': `${layout.minimumSlotWidth}px`, '--inventory-slot-min-height': `${layout.minimumSlotHeight}px` }}>
          {items.map((item, index) => {
            const visual = renderVisual ? renderVisual(item) : item.visual;
            return <InventorySlot
              key={item.id}
              item={item}
              index={index}
              selected={index === activeIndex}
              visual={visual}
              tabIndex={index === activeIndex ? 0 : -1}
              motion={motion}
              entryIndex={Math.min(index, 6)}
              onFocus={() => { if (item.id !== selectedId) onSelect?.(item.id); }}
              onClick={() => { onSelect?.(item.id); onActivate?.(item.id); }}
              onMouseEnter={() => { if (item.id !== selectedId) onSelect?.(item.id); }}
              ref={node => { if (node) buttons.current.set(item.id, node); else buttons.current.delete(item.id); }}
            />;
          })}
        </div>
      </div>
      <footer className="inventory-frame__footer">
        <p className="card-deck__hint"><span>ARROWS MOVE</span><span>SCROLL TO BROWSE</span><span>ENTER OPEN · ESC BACK</span></p>
      </footer>
    </InventoryFrame>
  </section>;
});

export default CardDeck;
