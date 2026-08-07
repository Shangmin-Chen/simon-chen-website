import React from 'react';
import LightboxComponent from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { imageUrl } from '../data/galleryData';

// Full-screen photo viewer for the album grid using yet-another-react-lightbox.
// Supports touch swipe navigation and pinch-to-zoom capabilities.
// Props: photos (array), index (number|null), onIndex (func), onClose (func)
const Lightbox = ({ photos, index, onIndex, onClose }) => {
  if (!photos || photos.length === 0) return null;

  const slides = photos.map((photo) => ({
    src: imageUrl(photo?.full),
    alt: photo?.alt || '',
    caption: photo?.caption,
    location: photo?.location,
  }));

  const isOpen = index !== null && index !== undefined && index >= 0 && index < photos.length;

  return (
    <LightboxComponent
      open={isOpen}
      index={index ?? 0}
      close={onClose}
      slides={slides}
      plugins={[Zoom]}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
      }}
      on={{
        view: ({ index: nextIndex }) => onIndex?.(nextIndex),
      }}
      render={{
        slideFooter: ({ slide }) => {
          if (!slide || (!slide.caption && !slide.location)) return null;
          return (
            <div className="lightbox-caption">
              {slide.caption && <span className="lightbox-cap-text">{slide.caption}</span>}
              {slide.location && <span className="lightbox-cap-loc">{slide.location}</span>}
            </div>
          );
        },
      }}
    />
  );
};

export default Lightbox;
