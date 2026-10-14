import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { containMediaSize, mediaOrientation } from '../domain/media-orientation';

function sameSize(first, second) {
  return first?.width === second.width && first?.height === second.height && first?.split === second.split;
}

export default function MediaStage({ src, alt, openerRef, boundsRef, notesRef, failed, onOpen, onError, onOrientation }) {
  const source = src;
  const slotRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState(null);
  const [availableSize, setAvailableSize] = useState({ width: 0, height: 0 });
  const currentSourceRef = useRef(source);

  useLayoutEffect(() => { currentSourceRef.current = source; }, [source]);

  useEffect(() => {
    const slot = slotRef.current;
    const bounds = boundsRef?.current ?? slot?.parentElement;
    const notes = notesRef?.current;
    if (!slot || !bounds) return undefined;
    const update = () => {
      const slotRect = slot.getBoundingClientRect();
      const boundsRect = bounds.getBoundingClientRect();
      const notesRect = notes?.getBoundingClientRect();
      const style = window.getComputedStyle(bounds);
      const splitLayout = style.display === 'flex' && style.flexDirection === 'row';
      const noteWidth = notes?.textContent.trim() ? notesRect?.width ?? 0 : 0;
      const gap = Number.parseFloat(splitLayout ? style.columnGap : style.rowGap) || 0;
      const next = {
        width: splitLayout ? boundsRect.width - noteWidth - gap : slotRect.width,
        height: splitLayout ? boundsRect.height : boundsRect.height - (notesRect?.height ?? 0) - gap,
        split: splitLayout,
      };
      setAvailableSize(current => sameSize(current, next) ? current : next);
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(update);
      observer.observe(slot);
      observer.observe(bounds);
      if (notes) observer.observe(notes);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [source, boundsRef, notesRef]);

  const size = naturalSize?.source === source
    ? containMediaSize(naturalSize.width, naturalSize.height, availableSize.width, availableSize.height)
    : null;

  const handleLoad = event => {
    const image = event.currentTarget;
    if (image.currentSrc !== source || currentSourceRef.current !== source) return;
    const orientation = mediaOrientation(image.naturalWidth, image.naturalHeight);
    if (orientation === 'unknown') {
      setNaturalSize(null);
      onOrientation(source, 'unknown');
      onError();
      return;
    }
    const next = { source, width: image.naturalWidth, height: image.naturalHeight };
    setNaturalSize(next);
    onOrientation(source, orientation);
  };

  const handleError = () => {
    if (currentSourceRef.current !== source) return;
    setNaturalSize(null);
    onOrientation(source, 'unknown');
    onError();
  };

  return <div
    className="photo-stage-slot"
    ref={slotRef}
    style={size && !failed ? {
      ...(size.split ? { width: `${size.width}px` } : {}),
      height: `${size.height}px`,
      flex: '0 0 auto',
    } : undefined}
  >
    <button
      ref={openerRef}
      type="button"
      className="photo-stage"
      data-ready={Boolean(size && !failed)}
      style={size && !failed ? { width: `${size.width}px`, height: `${size.height}px` } : undefined}
      aria-disabled={!size || failed}
      aria-busy={!size && !failed}
      aria-label={failed ? `Photo unavailable: ${alt}` : size ? `Open full-size photo: ${alt}` : `Loading photo: ${alt}`}
      onClick={() => { if (size && !failed) onOpen(); }}
    >
      <img className={size && !failed ? undefined : 'photo-stage-probe'} key={source} src={source} alt={size && !failed ? alt : ''} aria-hidden={!size || failed} onLoad={handleLoad} onError={handleError} />
      {size && !failed
        ? <span className="photo-zoom-hint" aria-hidden="true">[ open full image ]</span>
        : <span className="photo-stage-placeholder" aria-hidden="true">{failed ? 'Photo unavailable' : 'Loading photo…'}</span>}
    </button>
    {(!size || failed) && <span className="sr-only" role="status">{failed ? 'Photo unavailable' : 'Loading photo…'}</span>}
  </div>;
}
