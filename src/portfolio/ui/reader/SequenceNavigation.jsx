export default function SequenceNavigation({
  position,
  total,
  currentLabel,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
  navigationLabel = 'Items',
  previousLabel = 'Previous',
  nextLabel = 'Next',
}) {
  if (total <= 1) return null;

  return <nav className="sequence-navigation" aria-label={navigationLabel}>
    <button type="button" onClick={onPrevious} disabled={previousDisabled} aria-label={previousLabel}>← Previous</button>
    <span aria-live="polite">{position} / {total}{currentLabel && <span className="sr-only">: {currentLabel}</span>}</span>
    <button type="button" onClick={onNext} disabled={nextDisabled} aria-label={nextLabel}>Next →</button>
  </nav>;
}
