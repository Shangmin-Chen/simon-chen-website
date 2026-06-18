import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useGallery from '../hooks/useGallery';
import { galleryConfig, imageUrl } from '../data/galleryData';
import Lightbox from './Lightbox';

// Album index: a card per gallery, cover = first photo's thumbnail.
const AlbumIndex = ({ galleries }) => (
  <div className="album-grid">
    {galleries.map((album) => {
      const cover = album.photos?.[0];
      return (
        <Link to={`/gallery/${album.id}`} className="album-card" key={album.id}>
          <div className="album-card-cover">
            {cover && <img src={imageUrl(cover.thumb)} alt={cover.alt || ''} loading="lazy" />}
          </div>
          <div className="album-card-meta">
            <span className="album-card-title">{album.title}</span>
            <span className="album-card-count">
              {album.photos?.length ?? 0} photo{(album.photos?.length ?? 0) === 1 ? '' : 's'}
            </span>
          </div>
        </Link>
      );
    })}
  </div>
);

// Single album: thumbnail grid that opens a lightbox.
const AlbumView = ({ album }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const photos = album.photos ?? [];

  return (
    <>
      <div className="photo-grid">
        {photos.map((photo, i) => (
          <button
            type="button"
            className="photo-grid-item"
            key={photo.full}
            onClick={() => setLightboxIndex(i)}
            aria-label={`Open photo ${i + 1}: ${photo.caption || ''}`}
          >
            <img src={imageUrl(photo.thumb)} alt={photo.alt} loading="lazy" />
          </button>
        ))}
      </div>
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onIndex={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
};

const GalleryPage = () => {
  const { albumId } = useParams();
  const { galleries, loading, error } = useGallery();

  // Jump to top when entering a page (index ↔ album).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [albumId]);

  const album = albumId ? galleries.find((g) => g.id === albumId) : null;

  let body;
  if (loading) {
    body = <p className="cf-preview-msg cf-loading-msg">{galleryConfig.messages.loading}</p>;
  } else if (error) {
    body = (
      <p className="cf-preview-msg cf-error-msg">
        {galleryConfig.messages.error} {error}
      </p>
    );
  } else if (albumId && !album) {
    body = <p className="cf-preview-msg">That gallery doesn’t exist.</p>;
  } else if (!albumId && galleries.length === 0) {
    body = <p className="cf-preview-msg">{galleryConfig.messages.empty}</p>;
  } else if (album) {
    body = <AlbumView album={album} />;
  } else {
    body = <AlbumIndex galleries={galleries} />;
  }

  return (
    <section className="section gallery-page">
      <div className="container">
        <div className="gallery-page-head reveal">
          <div className="mono-label num">§ 07</div>
          {album ? (
            <>
              <Link to="/gallery" className="gallery-back">
                ← All galleries
              </Link>
              <h2>
                {album.title} <em>— frames</em>
              </h2>
            </>
          ) : (
            <>
              <Link to="/#gallery" className="gallery-back">
                ← Back home
              </Link>
              <h2>
                Gallery <em>— albums</em>
              </h2>
            </>
          )}
        </div>
        {body}
      </div>
    </section>
  );
};

export default GalleryPage;
