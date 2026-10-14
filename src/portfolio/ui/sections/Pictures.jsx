import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { imageUrl } from '../../../data/galleryData';
import Lightbox from '../../../components/Lightbox';
import { useResource } from '../../application/useResource';
import { movePhotoIndex, normalizePhotoIndex, restorePhotoIndex } from '../../domain/photo-selection';
import { photoAlt } from '../../domain/photos';
import ResourceState from '../ResourceState';

function PhotoThumbnail({ photo, index, selected, onSelect, albumId }) {
  const [failed, setFailed] = useState(false);
  const description = photoAlt(photo);
  return <button
    type="button"
    className="photo-thumb"
    data-selected={selected}
    aria-current={selected ? 'true' : undefined}
    aria-label={`Select photo ${index + 1}: ${description}`}
    onClick={onSelect}
  >
    {failed
      ? <span className="photo-thumb-unavailable">Unavailable</span>
      : <img src={imageUrl(photo.thumb || photo.full)} alt="" loading="lazy" onError={() => setFailed(true)} />}
    <span className="photo-thumb-number">{String(index + 1).padStart(2, '0')}</span>
    <span className="sr-only">{albumId}: {description}</span>
  </button>;
}

function AlbumReader({ album, selectedIndex, onSelect, active, motion }) {
  const photos = album.photos ?? [];
  const selected = normalizePhotoIndex(selectedIndex, photos.length);
  const photo = selected === null ? null : photos[selected];
  const photoDescription = photo ? photoAlt(photo) : '';
  const genericPhotoDescription = photo?.location?.trim() ? `${photo.location.trim()} photograph` : 'Photograph';
  const visibleCaption = photoDescription === genericPhotoDescription ? '' : photoDescription;
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [failedFull, setFailedFull] = useState({});
  const imageOpenerRef = useRef(null);
  const thumbStripRef = useRef(null);
  const detailsRef = useRef(null);
  const descriptionRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const wasLightboxOpen = useRef(false);
  const albumHeadingRef = useRef(null);
  const fullFailed = photo ? Boolean(failedFull[photo.full]) : false;

  useEffect(() => {
    if (!active || !thumbStripRef.current || selected === null) return;
    const strip = thumbStripRef.current;
    const thumb = strip.querySelector(`[data-photo-index="${selected}"]`);
    if (!thumb) return;
    const stripRect = strip.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const target = strip.scrollLeft + thumbRect.left - stripRect.left + (thumbRect.width - stripRect.width) / 2;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    strip.scrollTo({ left: Math.max(0, target), behavior: motion && !reduced ? 'smooth' : 'auto' });
  }, [active, motion, selected]);

  useEffect(() => {
    if (!active) return;
    if (detailsRef.current) detailsRef.current.scrollTop = 0;
    if (descriptionRef.current) descriptionRef.current.scrollTop = 0;
  }, [active, album.id, photo?.full]);

  useEffect(() => {
    if (lightboxIndex !== null) { wasLightboxOpen.current = true; return undefined; }
    if (!wasLightboxOpen.current) return undefined;
    wasLightboxOpen.current = false;
    const frame = window.requestAnimationFrame(() => {
      const opener = imageOpenerRef.current;
      if (active && opener?.isConnected && !opener.closest('[hidden]') && opener.getClientRects().length) opener.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active, lightboxIndex]);

  useEffect(() => {
    if (!active) return undefined;
    const frame = window.requestAnimationFrame(() => albumHeadingRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [active, album.id]);

  const select = index => {
    const next = normalizePhotoIndex(index, photos.length);
    if (next !== null) onSelect(next);
  };
  const move = delta => {
    const next = movePhotoIndex(selected, delta, photos.length);
    if (next !== null) onSelect(next);
  };
  const handleKeyDown = event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (lightboxIndex !== null || event.target.closest('[role="dialog"]')) return;
    if (event.key === 'ArrowLeft' && selected > 0) { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight' && selected < photos.length - 1) { event.preventDefault(); move(1); }
  };
  const handlePointerDown = event => {
    if (event.pointerType !== 'touch') return;
    dragRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const handlePointerUp = event => {
    const start = dragRef.current;
    dragRef.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 38 || Math.abs(dx) < Math.abs(dy)) return;
    suppressClickRef.current = true;
    window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    move(dx < 0 ? 1 : -1);
  };

  const updateLightboxIndex = index => {
    setLightboxIndex(index);
    select(index);
  };
  const closeLightbox = () => setLightboxIndex(null);

  return <section className="photo-workspace" aria-label={`${album.title} photo album`} onKeyDown={handleKeyDown}>
    <header className="photo-reader-head">
      <div className="photo-reader-title">
        <Link className="inline-link photo-back-link" to="/gallery">← albums</Link>
      <h2 className="section-heading" ref={albumHeadingRef} tabIndex={-1}>{album.title}</h2>
      </div>
      {selected !== null && <span className="photo-counter" aria-live="polite">{String(selected + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>}
    </header>
    {album.description && <p className="photo-album-description" ref={descriptionRef} role="region" aria-label={`${album.title} album description`} tabIndex={0}>{album.description}</p>}

    {photo ? <>
      <div
        className="photo-stage"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { dragRef.current = null; }}
        onClickCapture={event => {
          if (!suppressClickRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClickRef.current = false;
        }}
      >
        <button
          ref={imageOpenerRef}
          type="button"
          className="photo-full-opener"
          aria-disabled={fullFailed}
          aria-label={fullFailed ? `Photo ${selected + 1} unavailable` : `Open full-size photo ${selected + 1}: ${photoAlt(photo)}`}
          onClick={() => { if (!fullFailed) setLightboxIndex(selected); }}
        >
          {fullFailed
            ? <span className="photo-stage-unavailable" role="status">Photo unavailable</span>
            : <>
              <img src={imageUrl(photo.full)} alt={photoAlt(photo)} onError={() => setFailedFull(current => ({ ...current, [photo.full]: true }))} />
              <span className="photo-zoom-hint" aria-hidden="true">[ open full image ]</span>
            </>}
        </button>
      </div>

      <div className="photo-details" ref={detailsRef} role="region" aria-label={`${album.title} photo caption`} tabIndex={0} aria-live="polite">
        {visibleCaption && <p className="photo-caption-text">{visibleCaption}</p>}
        {photo.location?.trim() && <p className="photo-location">{photo.location.trim()}</p>}
      </div>

      <nav className="photo-controls" aria-label="Photo navigation">
        <button type="button" onClick={() => move(-1)} disabled={selected <= 0}>← Previous</button>
        <span>{selected + 1} of {photos.length}</span>
        <button type="button" onClick={() => move(1)} disabled={selected >= photos.length - 1}>Next →</button>
      </nav>

      <nav className="photo-thumb-strip" ref={thumbStripRef} aria-label="Choose a photo">
        {photos.map((item, index) => <span data-photo-index={index} key={`${album.id}/${item.full}`}>
          <PhotoThumbnail photo={item} index={index} selected={selected === index} albumId={album.title} onSelect={() => select(index)} />
        </span>)}
      </nav>

      {active && lightboxIndex !== null && <Lightbox photos={photos} index={lightboxIndex} onIndex={updateLightboxIndex} onClose={closeLightbox} />}
    </> : <div className="photo-empty-stage" role="status">No photos are available in this album.</div>}
  </section>;
}

export default function Pictures({ resource, active, albumId, motion = false }) {
  const result = useResource(resource, active);
  const albums = result.data?.galleries ?? [];
  const album = albums.find(item => item.id === albumId);
  const [selectionByAlbum, setSelectionByAlbum] = useState({});
  const [albumIndexState, setAlbumIndexState] = useState(0);
  const saveSelection = (id, index) => setSelectionByAlbum(current => ({ ...current, [id]: index }));
  const selectedIndex = album ? restorePhotoIndex(selectionByAlbum, album.id, album.photos?.length ?? 0) : null;
  const albumIndex = normalizePhotoIndex(albumIndexState, albums.length);
  const selectedAlbum = albumIndex === null ? null : albums[albumIndex];
  const previousAlbumRoute = useRef(Boolean(albumId));
  const indexHeadingRef = useRef(null);

  useEffect(() => {
    const focusIndex = active && previousAlbumRoute.current && !albumId;
    previousAlbumRoute.current = Boolean(albumId);
    if (!focusIndex) return undefined;
    const frame = window.requestAnimationFrame(() => indexHeadingRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [active, albumId]);

  if (!active) return null;

  return <ResourceState resource={result} loadingText="Connecting to the photo archive…" empty={!albums.length && !albumId}>
    {album
      ? <AlbumReader key={album.id} album={album} active={active} motion={motion} selectedIndex={selectedIndex} onSelect={index => saveSelection(album.id, index)} />
      : albumId
        ? <div className="photo-workspace photo-not-found"><h2 className="section-heading">Album not found</h2><Link className="inline-link" to="/gallery">← all albums</Link></div>
        : <div className="gallery-index">
          <h2 className="section-heading gallery-index-heading" ref={indexHeadingRef} tabIndex={-1}>pictures/</h2>
          <p className="terminal-note">A few frames from away from the keyboard.</p>
          {selectedAlbum && <>
            <nav className="album-index-controls" aria-label="Browse albums">
              <button type="button" onClick={() => setAlbumIndexState(index => Math.max(0, index - 1))} disabled={albumIndex <= 0}>← Previous album</button>
              <span aria-live="polite">{albumIndex + 1} / {albums.length}</span>
              <button type="button" onClick={() => setAlbumIndexState(index => Math.min(albums.length - 1, index + 1))} disabled={albumIndex >= albums.length - 1}>Next album →</button>
            </nav>
            <Link className="album-file" to={`/gallery/${encodeURIComponent(selectedAlbum.id)}`}><span aria-hidden="true">└─ </span>{selectedAlbum.title}<small>{selectedAlbum.photos?.length ?? 0} frames · open album ↗</small></Link>
          </>}
        </div>}
  </ResourceState>;
}
