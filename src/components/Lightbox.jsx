import React, { useCallback, useEffect } from 'react';
import { imageUrl } from '../data/galleryData';

// Full-screen photo viewer for the album grid. Keyboard: Esc closes, arrows
// navigate. `index` is controlled by the parent so the grid and viewer stay
// in sync.
const Lightbox = ({ photos, index, onIndex, onClose }) => {
  const count = photos.length;
  const photo = photos[index];

  const go = useCallback(
    (next) => onIndex(((next % count) + count) % count),
    [count, onIndex]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(index - 1);
      else if (e.key === 'ArrowRight') go(index + 1);
    };
    window.addEventListener('keydown', onKey);
    // Lock background scroll while the viewer is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, go, onClose]);

  if (!photo) return null;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onClose}
    >
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close viewer">
        ×
      </button>
      {count > 1 && (
        <button
          type="button"
          className="lightbox-nav lightbox-prev"
          onClick={(e) => {
            e.stopPropagation();
            go(index - 1);
          }}
          aria-label="Previous photo"
        >
          ←
        </button>
      )}
      <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
        <img className="lightbox-img" src={imageUrl(photo.full)} alt={photo.alt} />
        <figcaption className="lightbox-caption">
          <span className="lightbox-cap-text">{photo.caption}</span>
          {photo.location && <span className="lightbox-cap-loc">{photo.location}</span>}
        </figcaption>
      </figure>
      {count > 1 && (
        <button
          type="button"
          className="lightbox-nav lightbox-next"
          onClick={(e) => {
            e.stopPropagation();
            go(index + 1);
          }}
          aria-label="Next photo"
        >
          →
        </button>
      )}
    </div>
  );
};

export default Lightbox;
