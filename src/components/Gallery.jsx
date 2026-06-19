import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import useGallery from '../hooks/useGallery';
import { galleryConfig, imageUrl } from '../data/galleryData';

const SWIPE_THRESHOLD = 50; // px before a drag counts as a swipe

const Gallery = () => {
  const { galleries, featured, loading, error } = useGallery();

  // Resolve the featured album's photos into carousel slides (R2 URLs).
  const slides = useMemo(
    () =>
      (featured?.photos ?? []).map((photo) => ({
        ...photo,
        src: imageUrl(photo.full),
      })),
    [featured]
  );
  const count = slides.length;
  const note = featured?.note ?? galleryConfig.note;

  const [index, setIndex] = useState(0);
  const viewportRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, dx: 0, pointerId: null });
  const [dragX, setDragX] = useState(0);
  const baseId = useId();

  // Reset to the first frame whenever the active album changes.
  useEffect(() => {
    setIndex(0);
  }, [featured?.id]);

  const go = useCallback(
    (next) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );
  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  // Arrow-key navigation when the carousel has focus.
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  };

  // Pointer-based swipe (covers mouse + touch).
  const onPointerDown = (e) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      dx: 0,
      pointerId: e.pointerId,
    };
    viewportRef.current?.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.dx = dx;
    setDragX(dx);
  };

  const endDrag = () => {
    if (!dragRef.current.active) return;
    const dx = dragRef.current.dx;
    dragRef.current.active = false;
    setDragX(0);
    if (dx <= -SWIPE_THRESHOLD) next();
    else if (dx >= SWIPE_THRESHOLD) prev();
  };

  // Pause on tab-away is unnecessary (no autoplay); keep handlers minimal.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return undefined;
    node.addEventListener('pointerup', endDrag);
    node.addEventListener('pointercancel', endDrag);
    return () => {
      node.removeEventListener('pointerup', endDrag);
      node.removeEventListener('pointercancel', endDrag);
    };
    // endDrag closes over next/prev via refs + state setters; safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next, prev]);

  const pad = (n) => String(n + 1).padStart(2, '0');
  const active = slides[index] ?? slides[0];

  let body;
  if (loading) {
    body = <p className="cf-preview-msg cf-loading-msg">{galleryConfig.messages.loading}</p>;
  } else if (error) {
    body = (
      <p className="cf-preview-msg cf-error-msg">
        {galleryConfig.messages.error} {error}
      </p>
    );
  } else if (count === 0) {
    body = <p className="cf-preview-msg">{galleryConfig.messages.empty}</p>;
  } else {
    body = (
      <div
        className="carousel reveal"
        role="group"
        aria-roledescription="carousel"
        aria-label={featured?.title ? `${featured.title} photo gallery` : 'Photo gallery'}
      >
        <div
          ref={viewportRef}
          className="carousel-viewport"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          aria-label={`Slide ${index + 1} of ${count}. Use left and right arrow keys to navigate.`}
        >
          <div
            className="carousel-track"
            style={{
              transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
              transition: dragRef.current.active
                ? 'none'
                : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {slides.map((slide, i) => (
              <figure
                className="carousel-slide"
                key={slide.full}
                id={`${baseId}-slide-${i}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={i !== index}
              >
                <div className="carousel-frame">
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    draggable={false}
                    width="1200"
                    height="800"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>

        <div className="carousel-bar">
          <figcaption className="carousel-caption" aria-live="polite">
            <span className="carousel-cap-text">{active.caption}</span>
            {active.location && (
              <span className="carousel-cap-loc">{active.location}</span>
            )}
          </figcaption>

          <div className="carousel-controls">
            <button
              type="button"
              className="carousel-btn"
              onClick={prev}
              aria-label="Previous photo"
            >
              ←
            </button>
            <span className="carousel-counter" aria-hidden="true">
              {pad(index)} / {pad(count - 1)}
            </span>
            <button
              type="button"
              className="carousel-btn"
              onClick={next}
              aria-label="Next photo"
            >
              →
            </button>
          </div>
        </div>

        <div className="carousel-dots" aria-label="Choose photo">
          {slides.map((slide, i) => (
            <button
              type="button"
              key={slide.full}
              className={`carousel-dot ${i === index ? 'is-active' : ''}`}
              aria-label={`Go to photo ${i + 1}: ${slide.caption}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section id="gallery" className="section">
      <div className="container">
        <div className="section-head reveal">
          <div className="mono-label num">§ 07</div>
          <h2>
            Recent Frames <em>- Selected</em>
          </h2>
        </div>

        <div className="gallery-grid">
          <div className="mono-label reveal">{note}</div>
          <div className="gallery-main">
            {body}
            {!loading && !error && galleries.length > 0 && (
              <Link to="/gallery" className="gallery-all reveal">
                View full gallery →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
