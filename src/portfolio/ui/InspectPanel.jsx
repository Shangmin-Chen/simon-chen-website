import { useEffect, useRef } from 'react';
import ReaderFrame from './reader/ReaderFrame';
import DecodePhrase from './DecodePhrase';

export default function InspectPanel({ open, title, breadcrumb, onClose, backLabel = '← inventory', position, total, currentLabel, onPrevious, onNext, previousDisabled, nextDisabled, previousLabel, nextLabel, headingRef, bodyRef, navigationLabel, motion, revealKey, children }) {
  const panelRef = useRef(null);
  const previousOpen = useRef(open);

  useEffect(() => {
    if (previousOpen.current === open) return undefined;
    previousOpen.current = open;
    if (!open || !motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const panel = panelRef.current;
    const frame = panel?.querySelector('.inspect-panel__entry-frame');
    if (!panel || !frame || typeof panel.animate !== 'function' || typeof frame.animate !== 'function') return undefined;
    const panelAnimation = panel.animate([
      { clipPath: 'inset(0 100% 0 0)', opacity: 0.48, transform: 'translateX(-9px)' },
      { clipPath: 'inset(0)', opacity: 1, transform: 'translateX(0)' },
    ], { duration: 310, easing: 'cubic-bezier(.2,.78,.24,1)', fill: 'both' });
    const frameAnimation = frame.animate([
      { clipPath: 'inset(0 100% 0 0)', opacity: 0.35 },
      { clipPath: 'inset(0)', opacity: 1 },
    ], { duration: 330, easing: 'cubic-bezier(.18,.72,.24,1)', fill: 'both' });
    return () => {
      panelAnimation.cancel();
      frameAnimation.cancel();
    };
  }, [motion, open]);

  return <section className="inspect-panel" ref={panelRef} hidden={!open} data-open={open} data-motion={motion} aria-label={`${title} inspection`} aria-live="off">
    <span className="inspect-panel__entry-frame" aria-hidden="true" />
    <ReaderFrame
      title={title}
      titleContent={<DecodePhrase text={title} motion={motion && open} revealKey={revealKey} />}
      breadcrumb={breadcrumb}
      backLabel={backLabel}
      onBack={onClose}
      position={position}
      total={total}
      currentLabel={currentLabel}
      onPrevious={onPrevious}
      onNext={onNext}
      previousDisabled={previousDisabled}
      nextDisabled={nextDisabled}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      headingRef={headingRef}
      bodyRef={bodyRef}
      mode="text"
      navigationLabel={navigationLabel}
    >
      {children}
    </ReaderFrame>
  </section>;
}
