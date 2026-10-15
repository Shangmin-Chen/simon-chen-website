import SequenceNavigation from './SequenceNavigation';

export default function ReaderFrame({
  title,
  breadcrumb,
  backLabel,
  onBack,
  position = 0,
  total = 0,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
  headingRef,
  bodyRef,
  mode = 'text',
  navigationLabel = 'Reader navigation',
  children,
  hidden = false,
  titleContent,
}) {
  const isText = mode === 'text';
  return <section className={`reader-frame reader-frame--${mode}`} hidden={hidden} aria-label={`${title} reader`}>
    <header className="reader-frame__header">
      <div className="reader-frame__heading-group">
        <div className="reader-frame__breadcrumb">{breadcrumb}</div>
        <h2 className="reader-frame__title" ref={headingRef} tabIndex={-1}>{titleContent ?? title}</h2>
      </div>
      {onBack && <button className="reader-frame__back" type="button" onClick={onBack}>{backLabel}</button>}
    </header>
    <div
      className="reader-frame__body"
      ref={bodyRef}
      role={isText ? 'region' : undefined}
      tabIndex={isText ? 0 : undefined}
      aria-label={isText ? `${title} content` : undefined}
    >{children}</div>
    {total > 1 && <SequenceNavigation
      position={position}
      total={total}
      onPrevious={onPrevious}
      onNext={onNext}
      previousDisabled={previousDisabled}
      nextDisabled={nextDisabled}
      navigationLabel={navigationLabel}
    />}
  </section>;
}
