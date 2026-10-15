import useEntryReveal from './useEntryReveal';

const sigils = ['[::]', '[<>]', '[//]', '[##]', '[{}]', '[..]'];

export default function InventoryPreview({ item, index, count, visual, motion = true }) {
  const entry = useEntryReveal(motion, 'inventory-preview-entry');
  if (!item) return <aside className="inventory-preview" aria-label="Selected item preview" />;
  const titleId = `inventory-preview-title-${String(item.id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const meta = Array.isArray(item.meta) ? item.meta.filter(Boolean).join(' · ') : item.meta;
  const itemCounter = `${String(index + 1).padStart(2, '0')}/${String(count).padStart(2, '0')}`;
  const showMeta = meta && meta.replace(/\s/g, '') !== itemCounter;
  return <aside className="inventory-preview" aria-labelledby={titleId} data-entering={entry.entering ? 'true' : 'false'} onAnimationEnd={entry.handleAnimationEnd}>
    <div className="inventory-preview__display">
      <div className="inventory-preview__visual" aria-hidden="true">
        {visual || <span className="inventory-preview__sigil">{item.sigil ?? sigils[index % sigils.length]}</span>}
      </div>
      <div className="inventory-preview__details">
        <p className="inventory-preview__position">ITEM {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</p>
        <h2 id={titleId}>{item.title}</h2>
        {item.label && <p className="inventory-preview__path">{item.label}</p>}
        {item.description && <p className="inventory-preview__description">{item.description}</p>}
        {showMeta && <p className="inventory-preview__meta">{meta}</p>}
      </div>
    </div>
  </aside>;
}
