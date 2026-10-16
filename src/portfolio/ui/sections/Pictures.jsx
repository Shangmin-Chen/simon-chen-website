import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { imageUrl } from '../../../data/galleryData';
import Lightbox from '../../../components/Lightbox';
import { photoAlt } from '../../domain/photos';
import { restorePhotoIndex } from '../../domain/photo-selection';
import { useResource } from '../../application/useResource';
import CardDeck from '../CardDeck';
import ResourceState from '../ResourceState';

function Thumbnail({ source, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!source || failed) {
    return <span className={`gallery-card-placeholder ${className}`} aria-hidden="true">{failed ? 'Image unavailable' : 'No preview'}</span>;
  }
  return <img
    className={`gallery-card-image ${className}`}
    src={imageUrl(source)}
    alt=""
    loading="lazy"
    onError={() => setFailed(true)}
  />;
}

function photoItems(album) {
  const photos = album.photos ?? [];
  return photos.map((photo, index) => {
    const location = photo.location?.trim() ?? '';
    const caption = photoAlt(photo);
    const title = location.split(',')[0].trim() || caption;
    return {
      id: `${album.id}/${index}/${photo.full}`,
      kind: 'photo',
      title,
      accessibleLabel: caption,
      photo,
      index,
    };
  });
}

function albumItems(albums) {
  return albums.map(album => ({
    id: album.id,
    kind: 'photo',
    title: album.title,
    description: album.description?.trim() ?? '',
    meta: `${album.photos?.length ?? 0} photos`,
    album,
  }));
}

function SceneHeader({ breadcrumb, title, headingRef, onBack, backLabel = '← albums' }) {
  return <header className="gallery-scene__header">
    {(breadcrumb || title) && <div className="gallery-scene__heading">
      {breadcrumb && <span className="gallery-scene__breadcrumb">{breadcrumb}</span>}
      {title && <h2 ref={headingRef} tabIndex={-1}>{title}</h2>}
    </div>}
    {onBack && <button className="gallery-scene__back" type="button" onClick={onBack}>{backLabel}</button>}
  </header>;
}

const AlbumScene = forwardRef(function AlbumScene({ album, selectedIndex, onSelect, active, onBack, motion, onReturnToCharacters }, forwardedRef) {
  const deckRef = useRef(null);
  const sceneRef = useRef(null);
  const photos = album.photos ?? [];
  const items = useMemo(() => photoItems(album), [album]);
  const selected = restorePhotoIndex({ [album.id]: selectedIndex }, album.id, photos.length);
  const selectedItem = selected === null ? null : items[selected];
  const selectedId = selectedItem?.id ?? null;
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const wasOpen = useRef(false);

  useImperativeHandle(forwardedRef, () => ({
    focusContent() {
      if (!active) return false;
      if (deckRef.current?.focusContent?.()) return true;
      const scene = sceneRef.current;
      if (!scene?.isConnected || scene.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
      scene.focus({ preventScroll: true });
      return document.activeElement === scene;
    },
  }), [active]);

  useEffect(() => {
    if (!active) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const scene = sceneRef.current;
      const focused = document.activeElement;
      if (scene && (focused === document.body || !focused?.isConnected || scene.contains(focused))) deckRef.current?.focusContent?.();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active, album.id]);

  useEffect(() => {
    if (lightboxIndex !== null) {
      wasOpen.current = true;
      return undefined;
    }
    if (!wasOpen.current) return undefined;
    wasOpen.current = false;
    const frame = window.requestAnimationFrame(() => {
      if (active) deckRef.current?.focusSelected();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active, lightboxIndex]);

  const selectPhoto = id => {
    const item = items.find(candidate => candidate.id === id);
    if (item) onSelect(item.index);
  };
  const openPhoto = id => {
    const item = items.find(candidate => candidate.id === id);
    if (!item) return;
    onSelect(item.index);
    setLightboxIndex(item.index);
  };

  const handleKeyDown = event => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || event.keyCode === 229
      || event.altKey || event.ctrlKey || event.metaKey || lightboxIndex !== null
      || event.target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return;
    event.preventDefault();
    if (onBack) onBack();
    else onReturnToCharacters?.();
  };

  return <section
    ref={sceneRef}
    tabIndex={-1}
    className="gallery-scene"
    onKeyDown={handleKeyDown}
    aria-label={`${album.title} photo gallery`}
    aria-hidden={lightboxIndex !== null ? 'true' : undefined}
    inert={lightboxIndex !== null}
  >
    {onBack && <SceneHeader onBack={onBack} />}
    {album.description && <p className="gallery-scene__note">{album.description}</p>}
    <CardDeck
            ref={deckRef}
            items={items}
            selectedId={selectedId}
            onReturnToCharacters={onReturnToCharacters}
            onSelect={selectPhoto}
            onActivate={openPhoto}
            label="Photos"
            heading={album.title}
            emptyContent={<span>No photos are available in this album.</span>}
            motion={motion && lightboxIndex === null}
            renderVisual={item => <Thumbnail key={item.photo.thumb ?? ''} source={item.photo.thumb} />}
    />
    {active && lightboxIndex !== null && <Lightbox
      photos={photos}
      index={lightboxIndex}
      onIndex={index => {
        setLightboxIndex(index);
        onSelect(index);
      }}
      onClose={() => setLightboxIndex(null)}
      motion={motion}
    />}
  </section>;
});

const Pictures = forwardRef(function Pictures({ resource, active, albumId, motion = true, onReturnToCharacters }, forwardedRef) {
  const navigate = useNavigate();
  const result = useResource(resource, active);
  const albums = result.data?.galleries ?? [];
  const [selectionByAlbum, setSelectionByAlbum] = useState({});
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const indexHeadingRef = useRef(null);
  const indexSceneRef = useRef(null);
  const indexDeckRef = useRef(null);
  const albumSceneRef = useRef(null);
  const previousAlbumRoute = useRef(Boolean(albumId));
  const hasAlbumScene = albumId ? albums.some(item => item.id === albumId) : albums.length === 1;

  useEffect(() => {
    const returnedToIndex = active && previousAlbumRoute.current && !albumId;
    previousAlbumRoute.current = Boolean(albumId);
    if (!returnedToIndex) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const scene = indexSceneRef.current;
      const focused = document.activeElement;
      if (scene && (focused === document.body || !focused?.isConnected || scene.contains(focused))) indexDeckRef.current?.focusContent?.();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active, albumId]);

  useImperativeHandle(forwardedRef, () => ({
    focusContent() {
      if (!active) return false;
      if (hasAlbumScene && albumSceneRef.current?.focusContent?.()) return true;
      if (!hasAlbumScene && !albumId && indexDeckRef.current?.focusContent?.()) return true;
      const fallback = indexHeadingRef.current ?? indexSceneRef.current;
      if (!fallback?.isConnected || fallback.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
      fallback.focus({ preventScroll: true });
      return document.activeElement === fallback;
    },
  }), [active, albumId, hasAlbumScene]);

  if (!active) return null;

  const routeAlbum = albumId ? albums.find(item => item.id === albumId) : null;
  if (albumId && !routeAlbum) {
    const title = result.status === 'ready'
      ? 'Album not found'
      : result.status === 'error' ? 'Photo archive unavailable' : 'Opening album…';
    return <section ref={indexSceneRef} tabIndex={-1} className="gallery-scene gallery-scene--status" aria-label={title}>
      <SceneHeader breadcrumb="pictures/" title={title} headingRef={indexHeadingRef} onBack={() => navigate('/gallery')} />
      <ResourceState resource={result} loadingText="Connecting to the photo archive…" empty={false}>
        <p className="gallery-scene__empty" role="status">This album is not in the photo archive.</p>
      </ResourceState>
    </section>;
  }

  if (result.status === 'idle' || result.status === 'loading' || result.status === 'error') {
    return <section ref={indexSceneRef} tabIndex={-1} className="gallery-scene gallery-scene--status" aria-label="Photo archive">
      <SceneHeader breadcrumb="pictures/" title="Pictures" headingRef={indexHeadingRef} onBack={onReturnToCharacters} backLabel="← characters" />
      <ResourceState resource={result} loadingText="Connecting to the photo archive…" empty={false} />
    </section>;
  }

  // With one album, its photo deck is the Pictures landing view. The album URL
  // remains a valid deep link, while the direct deck removes an extra click.
  const album = routeAlbum ?? (!albumId && albums.length === 1 ? albums[0] : null);
  if (album) {
    const selectedIndex = restorePhotoIndex(selectionByAlbum, album.id, album.photos?.length ?? 0);
    return <AlbumScene
      ref={albumSceneRef}
      key={album.id}
      album={album}
      active={active}
      motion={motion}
      selectedIndex={selectedIndex}
      onReturnToCharacters={onReturnToCharacters}
      onSelect={index => setSelectionByAlbum(current => ({ ...current, [album.id]: index }))}
      onBack={albums.length > 1 ? () => navigate('/gallery') : undefined}
    />;
  }

  const items = albumItems(albums);
  const selectedId = items.some(item => item.id === selectedAlbumId) ? selectedAlbumId : items[0]?.id ?? null;
  return <section ref={indexSceneRef} tabIndex={-1} className="gallery-scene" aria-label="Photo albums">
    <p className="gallery-scene__note">A few frames from away from the keyboard.</p>
    <CardDeck
      ref={indexDeckRef}
      items={items}
      selectedId={selectedId}
      onReturnToCharacters={onReturnToCharacters}
      onSelect={setSelectedAlbumId}
      onActivate={id => navigate(`/gallery/${encodeURIComponent(id)}`)}
      label="Photo albums"
      heading="Pictures"
      emptyContent={<span>No photos are available yet.</span>}
      motion={motion}
      renderVisual={item => <Thumbnail key={item.album.photos?.[0]?.thumb ?? ''} source={item.album.photos?.[0]?.thumb} />}
    />
  </section>;
});

export default Pictures;
