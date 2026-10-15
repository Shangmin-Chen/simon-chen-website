import { forwardRef } from 'react';
import useEntryReveal from './useEntryReveal';

const sigils = ['[::]', '[<>]', '[//]', '[##]', '[{}]', '[..]'];

const InventorySlot = forwardRef(function InventorySlot({ item, index, selected, visual, tabIndex, onFocus, onClick, onMouseEnter, motion = true, entryIndex = 0 }, ref) {
  const entry = useEntryReveal(motion, 'inventory-slot-entry');
  const meta = Array.isArray(item.meta) ? item.meta.filter(Boolean).join(' · ') : item.meta;

  return <button
    className="inventory-slot"
    type="button"
    ref={ref}
    data-inventory-index={index}
    tabIndex={tabIndex}
    aria-label={item.title}
    aria-pressed={selected}
    data-visual={visual ? 'true' : 'false'}
    data-selected={selected ? 'true' : 'false'}
    data-entering={entry.entering ? 'true' : 'false'}
    style={{ '--inventory-entry-index': entryIndex }}
    onAnimationEnd={entry.handleAnimationEnd}
    onFocus={onFocus}
    onMouseEnter={onMouseEnter}
    onClick={onClick}
  >
    <span className="inventory-slot__media" aria-hidden="true">
      {visual || <span className="inventory-slot__sigil">{item.sigil ?? sigils[index % sigils.length]}</span>}
    </span>
    <span className="inventory-slot__copy">
      <span className="inventory-slot__label">{item.title}</span>
      {item.label && <span className="inventory-slot__path">{item.label}</span>}
      {item.description && <span className="inventory-slot__description">{item.description}</span>}
      {meta && <span className="inventory-slot__meta">{meta}</span>}
    </span>
    <span className="inventory-slot__index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
  </button>;
});

export default InventorySlot;
