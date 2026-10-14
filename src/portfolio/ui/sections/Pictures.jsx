import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { imageUrl } from '../../../data/galleryData';
import Lightbox from '../../../components/Lightbox';
import MediaStage from '../MediaStage';
import ReaderFrame from '../reader/ReaderFrame';
import SequenceNavigation from '../reader/SequenceNavigation';
import { useResource } from '../../application/useResource';
import { movePhotoIndex, normalizePhotoIndex, restorePhotoIndex } from '../../domain/photo-selection';
import { orientationForSource } from '../../domain/media-orientation';
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

function AlbumReader({ album, resource, selectedIndex, onSelect, active, motion, onBack }) {
  const photos = album.photos ?? [];
  const selected = normalizePhotoIndex(selectedIndex, photos.length);
  const photo = selected === null ? null : photos[selected];
  const photoDescription = photo ? photoAlt(photo) : '';
  const genericPhotoDescription = photo?.location?.trim() ? `${photo.location.trim()} photograph` : 'Photograph';
  const visibleCaption = photoDescription === genericPhotoDescription ? '' : photoDescription;
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [failedFull, setFailedFull] = useState({});
  const [loadedMedia, setLoadedMedia] = useState(null);
  const imageOpenerRef = useRef(null);
  const mediaBodyRef = useRef(null);
  const thumbStripRef = useRef(null);
  const detailsRef = useRef(null);
  const descriptionRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const wasLightboxOpen = useRef(false);
  const fullFailed = photo ? Boolean(failedFull[photo.full]) : false;
  const fullSource = photo ? imageUrl(photo.full) : '';
  const orientation = orientationForSource(loadedMedia, fullSource);
  const currentSourceRef = useRef('');
  useLayoutEffect(() => { currentSourceRef.current = fullSource; }, [fullSource]);

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

  const albumHeadingRef = useRef(null);
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

  const moveAlbumPhoto = delta => move(delta);
  return <div className="photo-workspace" role="region" aria-label={`${album.title} photo album`} onKeyDown={handleKeyDown}>
    <ReaderFrame
      title={album.title}
      breadcrumb="pictures/"
      backLabel="← albums"
      onBack={onBack}
      position={selected === null ? 0 : selected + 1}
      total={photos.length}
      onPrevious={() => moveAlbumPhoto(-1)}
      onNext={() => moveAlbumPhoto(1)}
      previousDisabled={selected === null || selected <= 0}
      nextDisabled={selected === null || selected >= photos.length - 1}
      headingRef={albumHeadingRef}
      mode="media"
      navigationLabel="Photo navigation"
    >
      <div className="photo-reader-content">
        <ResourceState resource={resource} loadingText="Connecting to the photo archive…" empty={false}>
          {photo ? <>
            <div
              ref={mediaBodyRef}
              className="photo-media-body"
              data-orientation={orientation}
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
              <MediaStage
                src={fullSource}
                alt={photoAlt(photo)}
                openerRef={imageOpenerRef}
                boundsRef={mediaBodyRef}
                notesRef={detailsRef}
                failed={fullFailed}
                onOpen={() => setLightboxIndex(selected)}
                onError={() => {
                  if (currentSourceRef.current !== fullSource) return;
                  setFailedFull(current => ({ ...current, [photo.full]: true }));
                }}
                onOrientation={(source, nextOrientation) => {
                  if (currentSourceRef.current !== source) return;
                  setLoadedMedia(nextOrientation === 'unknown' ? null : { source, orientation: nextOrientation });
                }}
              />
              <div className="photo-details" ref={detailsRef} role="region" aria-label={`${album.title} photo notes`} tabIndex={0} aria-live="polite">
                {album.description && <p className="photo-album-description" ref={descriptionRef}>{album.description}</p>}
                {visibleCaption && <p className="photo-caption-text">{visibleCaption}</p>}
                {photo.location?.trim() && <p className="photo-location">{photo.location.trim()}</p>}
              </div>
            </div>

            <nav className="photo-thumb-strip" ref={thumbStripRef} aria-label="Choose a photo">
              {photos.map((item, index) => <span data-photo-index={index} key={`${album.id}/${item.full}`}>
                <PhotoThumbnail photo={item} index={index} selected={selected === index} albumId={album.title} onSelect={() => select(index)} />
              </span>)}
            </nav>
          </> : <div className="photo-empty-stage" role="status">No photos are available in this album.</div>}
        </ResourceState>
      </div>
    </ReaderFrame>
    {active && lightboxIndex !== null && <Lightbox photos={photos} index={lightboxIndex} onIndex={updateLightboxIndex} onClose={closeLightbox} />}
  </div>;
}

export default function Pictures({ resource, active, albumId, motion = false }) {
  const navigate = useNavigate();
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

  if (albumId && !album) {
    const title = result.status === 'ready'
      ? 'Album not found'
      : result.status === 'error' ? 'Photo archive unavailable' : 'Opening album…';
    return <div className="photo-workspace photo-not-found">
      <ReaderFrame
        title={title}
        breadcrumb="pictures/"
        backLabel="← albums"
        onBack={() => navigate('/gallery')}
        mode="media"
      >
        <div className="photo-reader-content photo-status-body">
          <ResourceState resource={result} loadingText="Connecting to the photo archive…" empty={false}>
            <p className="gallery-reader-status" role="status">This album is not in the photo archive.</p>
          </ResourceState>
        </div>
      </ReaderFrame>
    </div>;
  }

  if (albumId && album) {
    return <AlbumReader key={album.id} album={album} resource={result} active={active} motion={motion} selectedIndex={selectedIndex} onSelect={index => saveSelection(album.id, index)} onBack={() => navigate('/gallery')} />;
  }

  return <ResourceState resource={result} loadingText="Connecting to the photo archive…" empty={!albums.length && !albumId}>
    <div className="gallery-index">
          <h2 className="section-heading gallery-index-heading" ref={indexHeadingRef} tabIndex={-1}>pictures/</h2>
          <p className="terminal-note">A few frames from away from the keyboard.</p>
          {selectedAlbum && <>
            {albums.length > 1 && <SequenceNavigation
              position={albumIndex + 1}
              total={albums.length}
              onPrevious={() => setAlbumIndexState(index => Math.max(0, index - 1))}
              onNext={() => setAlbumIndexState(index => Math.min(albums.length - 1, index + 1))}
              previousDisabled={albumIndex <= 0}
              nextDisabled={albumIndex >= albums.length - 1}
              navigationLabel="Album selection"
              previousLabel="Previous album"
              nextLabel="Next album"
            />}
            <Link className="file-index-item album-file" to={`/gallery/${encodeURIComponent(selectedAlbum.id)}`}>
              <span className="file-index-tree" aria-hidden="true">└─</span>
              <span className="file-index-copy"><strong>{selectedAlbum.title}</strong><small>{selectedAlbum.photos?.length ?? 0} frames</small></span>
              <span className="file-index-open" aria-hidden="true">↗</span>
            </Link>
          </>}
    </div>
  </ResourceState>;
}
