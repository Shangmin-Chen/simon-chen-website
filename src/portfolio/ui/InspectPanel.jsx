import ReaderFrame from './reader/ReaderFrame';
import DecodePhrase from './DecodePhrase';

export default function InspectPanel({ open, title, breadcrumb, onClose, position, total, onPrevious, onNext, previousDisabled, nextDisabled, headingRef, bodyRef, navigationLabel, motion, revealKey, children }) {
  return <section className="inspect-panel" hidden={!open} aria-label={`${title} inspection`} aria-live="off">
    <ReaderFrame
      title={title}
      titleContent={<DecodePhrase text={title} motion={motion && open} revealKey={revealKey} />}
      breadcrumb={breadcrumb}
      backLabel="← close inspection"
      onBack={onClose}
      position={position}
      total={total}
      onPrevious={onPrevious}
      onNext={onNext}
      previousDisabled={previousDisabled}
      nextDisabled={nextDisabled}
      headingRef={headingRef}
      bodyRef={bodyRef}
      mode="text"
      navigationLabel={navigationLabel}
    >
      {children}
    </ReaderFrame>
  </section>;
}
