import { forwardRef } from 'react';
import { signalSeed } from '../domain/decode';
import SignalBands from './SignalBands';
import useSignalBurst from './useSignalBurst';

const sigils = ['[::]', '[<>]', '[//]', '[##]', '[{}]', '[..]'];

const InventorySlot = forwardRef(function InventorySlot({ item, index, selected, visual, tabIndex, onFocus, onClick, onMouseEnter, motion = true }, ref) {
  const signal = useSignalBurst(motion, 320, 8);
  const face = <>
    <span className="inventory-slot__media" aria-hidden="true">
      {visual || <span className="inventory-slot__sigil">{item.sigil ?? sigils[index % sigils.length]}</span>}
    </span>
    {!visual && <span className="inventory-slot__label">{item.title}</span>}
  </>;

  return <button
    className="inventory-slot"
    type="button"
    ref={ref}
    tabIndex={tabIndex}
    aria-label={item.title}
    aria-pressed={selected}
    data-visual={visual ? 'true' : 'false'}
    data-selected={selected ? 'true' : 'false'}
    onFocus={event => { signal.start(); onFocus?.(event); }}
    onMouseEnter={() => { signal.start(); onMouseEnter?.(); }}
    onClick={onClick}
  >
    {face}
    <span className="inventory-slot__index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
    {motion && signal.tick >= 0 && <SignalBands seed={signalSeed(item.id)} tick={signal.tick} className="inventory-slot__signals">{face}</SignalBands>}
  </button>;
});

export default InventorySlot;
