import React from 'react';
import LightboxComponent from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { imageUrl } from '../data/galleryData';

const GENERIC_CAPTION_RE = /^(?:[^,]+,\s*)?photo\s+\d+$/i;

const composeAlt = (photo) => {
  const alt = typeof photo?.alt === 'string' ? photo.alt.trim() : '';
  if (alt && !GENERIC_CAPTION_RE.test(alt)) return alt;
  const caption = typeof photo?.caption === 'string' ? photo.caption.trim() : '';
  if (caption && !GENERIC_CAPTION_RE.test(caption)) return caption;
  const location = typeof photo?.location === 'string' ? photo.location.trim() : '';
  if (location) return `${location} photograph`;
  return 'Photograph';
};

// Enhanced photo viewer supporting touch swipe & multi-touch pinch zoom.
const Lightbox = ({ photos = [], index, onIndex, onClose }) => {
  const isOpen = index !== null && index !== undefined && index >= 0 && index < photos.length;

  const slides = photos.map((photo) => ({
    src: imageUrl(photo?.full),
    alt: composeAlt(photo),
    caption: photo?.caption,
    location: photo?.location,
  }));

  if (!isOpen) return null;

  return (
    <LightboxComponent
      open={isOpen}
      close={onClose}
      index={index}
      slides={slides}
      on={{
        view: ({ index: current }) => onIndex(current),
      }}
      plugins={[Zoom]}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
      }}
      render={{
        slideFooter: ({ slide }) => (
          <figcaption className="lightbox-caption">
            {slide.caption && <span className="lightbox-cap-text">{slide.caption}</span>}
            {slide.location && <span className="lightbox-cap-loc">{slide.location}</span>}
          </figcaption>
        ),
      }}
    />
  );
};

export default Lightbox;
