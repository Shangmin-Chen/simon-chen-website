import { forwardRef, useId } from 'react';
import useEntryReveal from './useEntryReveal';

const InventorySlot = forwardRef(function InventorySlot({ item, index, selected, visual, tabIndex, onFocus, onClick, motion = true, entryIndex = 0 }, ref) {
  const entry = useEntryReveal(motion, 'inventory-slot-entry');
  const meta = Array.isArray(item.meta) ? item.meta.filter(Boolean).join(' · ') : item.meta;
  const kind = item.kind ?? (item.photo ? 'photo' : visual ? 'letter' : 'text');
  const accessibleLabel = item.accessibleLabel ?? (item.purpose ? `${item.title}: ${item.purpose}` : item.title);
  const descriptionId = useId();
  const fileId = `${descriptionId}-file`;
  const detailId = `${descriptionId}-detail`;
  const metaId = `${descriptionId}-meta`;
  const hasDetails = item.label || item.description || meta;
  const describedBy = kind === 'dossier'
    ? [fileId, item.detail ? detailId : '', metaId].filter(Boolean).join(' ')
    : kind === 'photo' ? descriptionId : hasDetails ? descriptionId : undefined;

  return <button
    className="inventory-slot"
    type="button"
    ref={ref}
    data-inventory-index={index}
    tabIndex={tabIndex}
    aria-label={accessibleLabel}
    aria-describedby={describedBy}
    aria-pressed={selected}
    data-visual={visual ? 'true' : 'false'}
    data-kind={kind}
    data-selected={selected ? 'true' : 'false'}
    data-entering={entry.entering ? 'true' : 'false'}
    style={{ '--inventory-entry-index': entryIndex }}
    onAnimationEnd={entry.handleAnimationEnd}
    onFocus={onFocus}
    onClick={onClick}
  >
    {kind === 'dossier' ? <>
      <span className="inventory-dossier__head" id={fileId}><span>{item.label}</span><span aria-hidden="true">↗</span></span>
      <span className="inventory-dossier__title">{item.title}</span>
      <span className="inventory-dossier__purpose">{item.purpose}</span>
      {item.detail && <span className="inventory-dossier__detail" id={detailId}>{item.detail}</span>}
      <span className="inventory-dossier__bottom" id={metaId}>
        {Array.isArray(item.tags) && <span className="inventory-dossier__tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</span>}
        {meta && <span className="inventory-dossier__meta">{meta}</span>}
      </span>
    </> : <>
      {visual && <span className="inventory-slot__media" aria-hidden="true">{visual}</span>}
      <span className="inventory-slot__copy">
        <span className="inventory-slot__label" id={kind === 'photo' ? descriptionId : undefined}>{item.title}</span>
        {hasDetails && <span className="inventory-slot__details" id={kind === 'photo' ? undefined : descriptionId}>
          {item.label && kind !== 'photo' && <span className="inventory-slot__path">{item.label}</span>}
          {item.description && <span className="inventory-slot__description">{item.description}</span>}
          {meta && <span className="inventory-slot__meta">{meta}</span>}
        </span>}
      </span>
    </>}
    <span className="inventory-slot__index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
  </button>;
});

export default InventorySlot;
