import useEntryReveal from './useEntryReveal';

export default function InventoryFrame({ children, motion = true }) {
  const entry = useEntryReveal(motion, 'inventory-frame-entry');

  return <div className="inventory-frame" data-entering={entry.entering ? 'true' : 'false'} onAnimationEnd={entry.handleAnimationEnd}>
    <span className="inventory-frame__trace inventory-frame__trace--top" aria-hidden="true" />
    <span className="inventory-frame__trace inventory-frame__trace--right" aria-hidden="true" />
    <span className="inventory-frame__trace inventory-frame__trace--bottom" aria-hidden="true" />
    <span className="inventory-frame__trace inventory-frame__trace--left" aria-hidden="true" />
    <span className="inventory-frame__corner inventory-frame__corner--top-left" aria-hidden="true" />
    <span className="inventory-frame__corner inventory-frame__corner--top-right" aria-hidden="true" />
    <span className="inventory-frame__corner inventory-frame__corner--bottom-right" aria-hidden="true" />
    <span className="inventory-frame__corner inventory-frame__corner--bottom-left" aria-hidden="true" />
    {children}
  </div>;
}
