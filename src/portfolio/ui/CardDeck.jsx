import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { cardIndexFor, moveInventoryIndex } from '../domain/card-navigation';
import { inventoryLayout } from '../domain/inventory-layout';
import InventoryFrame from './InventoryFrame';
import InventoryPreview from './InventoryPreview';
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
  const layoutCacheRef = useRef(null);
  const buttons = useRef(new Map());
  const focusFrame = useRef(0);
  const lastBoundsRef = useRef(null);
  const initialRevealRef = useRef(false);
  const pendingResizeRevealRef = useRef(false);
  const [layout, setLayout] = useState(() => inventoryLayout(0, 0));
  const [documentVisible, setDocumentVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  const activeIndex = cardIndexFor(items, selectedId);
  const previewItem = items[activeIndex] ?? items[0];
  const previewVisual = previewItem ? (renderVisual ? renderVisual(previewItem) : previewItem.visual) : null;

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
    const deck = deckRef.current;
    if (!deck) return;
    const bounds = { width: deck.clientWidth, height: deck.clientHeight };
    const previousBounds = lastBoundsRef.current;
    if (previousBounds && (previousBounds.width !== bounds.width || previousBounds.height !== bounds.height)) {
      pendingResizeRevealRef.current = true;
    }
    lastBoundsRef.current = bounds;
    const next = inventoryLayout(bounds.width, bounds.height);
    const current = layoutCacheRef.current;
    if (current?.width === next.width && current.height === next.height && current.wide === next.wide && current.showPreview === next.showPreview && current.columns === next.columns && current.rackHeight === next.rackHeight && current.previewHeight === next.previewHeight && current.minimumSlotHeight === next.minimumSlotHeight) return;
    layoutCacheRef.current = next;
    setLayout(next);
  }, []);

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
    }
  };

  const activateSelected = () => {
    if (!previewItem) return;
    onSelect?.(previewItem.id);
    onActivate?.(previewItem.id);
  };

  const compactPreview = layout.wide ? layout.availableHeight < 130 : layout.previewHeight < 130;

  return <section className="card-deck" ref={deckRef} data-layout={layout.wide ? 'wide' : 'stacked'} data-show-preview={layout.showPreview ? 'true' : 'false'} data-preview-compact={compactPreview ? 'true' : 'false'} data-motion={motion} data-document-visible={documentVisible ? 'true' : 'false'} aria-label={label} onKeyDown={handleKeyDown}>
    <InventoryFrame motion={motion}>
      <header className="inventory-frame__header">
        <h2>{label.toUpperCase()}</h2>
        <span>{String(items.length).padStart(2, '0')} ITEMS</span>
      </header>
      <div className="inventory-layout" data-layout={layout.wide ? 'wide' : 'stacked'} data-show-preview={layout.showPreview ? 'true' : 'false'} data-preview-compact={compactPreview ? 'true' : 'false'} style={{ '--inventory-columns': layout.columns, '--inventory-slot-min-height': `${layout.minimumSlotHeight}px`, '--inventory-preview-height': `${layout.previewHeight}px` }}>
        <div className="inventory-rack" role="group" aria-label={`${label} inventory`}>
          <div className="inventory-slots" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
          {items.map((item, index) => {
            const visual = renderVisual ? renderVisual(item) : item.visual;
            return <InventorySlot
              key={item.id}
              item={item}
              index={index}
              selected={item.id === previewItem?.id}
              visual={visual}
              tabIndex={item.id === previewItem?.id ? 0 : -1}
              motion={motion}
              entryIndex={index}
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
        {layout.showPreview && previewItem && <div className="inventory-frame__controls">
          <button className="inventory-frame__open" type="button" onClick={activateSelected} aria-label={`Open ${previewItem.title}`}>
            OPEN ITEM <span aria-hidden="true">↗</span>
          </button>
        </div>}
        <p className="card-deck__hint"><span>↑ ↓ MOVE</span><span>SCROLL TO BROWSE</span><span>ENTER OPEN · ESC BACK</span></p>
      </footer>
    </InventoryFrame>
  </section>;
});

export default CardDeck;
