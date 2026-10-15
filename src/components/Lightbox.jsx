import React from 'react';
import LightboxComponent from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { imageUrl } from '../data/galleryData';
import { photoAlt } from '../portfolio/domain/photos';
import DecodePhrase from '../portfolio/ui/DecodePhrase';

// Enhanced photo viewer supporting touch swipe & multi-touch pinch zoom.
const Lightbox = ({ photos = [], index, onIndex, onClose, motion = true }) => {
  const isOpen = index !== null && index !== undefined && index >= 0 && index < photos.length;

  const slides = photos.map((photo) => ({
    src: imageUrl(photo?.full),
    alt: photoAlt(photo),
    caption: photo?.caption,
    location: photo?.location,
  }));

  if (!isOpen) return null;
  const activeSource = slides[index]?.src;

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
            {slide.caption && <span className="lightbox-cap-text"><DecodePhrase key={slide.src} text={slide.caption} motion={motion && slide.src === activeSource} revealKey={slide.src} /></span>}
            {slide.location && <span className="lightbox-cap-loc">{slide.location}</span>}
          </figcaption>
        ),
      }}
    />
  );
};

export default Lightbox;
