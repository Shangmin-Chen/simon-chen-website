import { useEffect, useRef, useState } from 'react';
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
    const title = photoAlt(photo);
    const location = photo.location?.trim() ?? '';
    const description = location && location !== title ? location : '';
    return {
      id: `${album.id}/${index}/${photo.full}`,
      title,
      description,
      meta: `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`,
      photo,
      index,
    };
  });
}

function albumItems(albums) {
  return albums.map(album => ({
    id: album.id,
    title: album.title,
    description: album.description?.trim() ?? '',
    meta: `${album.photos?.length ?? 0} photos`,
    album,
  }));
}

function SceneHeader({ breadcrumb, title, headingRef, onBack, backLabel = '← albums' }) {
  return <header className="gallery-scene__header">
    <div className="gallery-scene__heading">
      <span className="gallery-scene__breadcrumb">{breadcrumb}</span>
      <h2 ref={headingRef} tabIndex={-1}>{title}</h2>
    </div>
    {onBack && <button className="gallery-scene__back" type="button" onClick={onBack}>{backLabel}</button>}
  </header>;
}

function AlbumScene({ album, resource, selectedIndex, onSelect, active, onBack }) {
  const deckRef = useRef(null);
  const photos = album.photos ?? [];
  const selected = restorePhotoIndex({ [album.id]: selectedIndex }, album.id, photos.length);
  const selectedItem = selected === null ? null : photoItems(album)[selected];
  const selectedId = selectedItem?.id ?? null;
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const wasOpen = useRef(false);
  const headingRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const frame = window.requestAnimationFrame(() => headingRef.current?.focus());
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
    const item = photoItems(album).find(candidate => candidate.id === id);
    if (item) onSelect(item.index);
  };
  const openPhoto = id => {
    const item = photoItems(album).find(candidate => candidate.id === id);
    if (!item) return;
    onSelect(item.index);
    setLightboxIndex(item.index);
  };

  return <section
    className="gallery-scene"
    aria-label={`${album.title} photo gallery`}
    aria-hidden={lightboxIndex !== null ? 'true' : undefined}
    inert={lightboxIndex !== null}
  >
    <SceneHeader breadcrumb="pictures/" title={album.title} headingRef={headingRef} onBack={onBack} />
    {album.description && <p className="gallery-scene__note">{album.description}</p>}
    <ResourceState resource={resource} loadingText="Connecting to the photo archive…" empty={false}>
      {photos.length
        ? <CardDeck
            ref={deckRef}
            items={photoItems(album)}
            selectedId={selectedId}
            onSelect={selectPhoto}
            onActivate={openPhoto}
            label={`${album.title} photos`}
            renderVisual={item => <Thumbnail key={item.photo.thumb ?? ''} source={item.photo.thumb} />}
          />
        : <p className="gallery-scene__empty" role="status">No photos are available in this album.</p>}
    </ResourceState>
    {active && lightboxIndex !== null && <Lightbox
      photos={photos}
      index={lightboxIndex}
      onIndex={index => {
        setLightboxIndex(index);
        onSelect(index);
      }}
      onClose={() => setLightboxIndex(null)}
    />}
  </section>;
}

export default function Pictures({ resource, active, albumId }) {
  const navigate = useNavigate();
  const result = useResource(resource, active);
  const albums = result.data?.galleries ?? [];
  const [selectionByAlbum, setSelectionByAlbum] = useState({});
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const indexHeadingRef = useRef(null);
  const previousAlbumRoute = useRef(Boolean(albumId));

  useEffect(() => {
    const returnedToIndex = active && previousAlbumRoute.current && !albumId;
    previousAlbumRoute.current = Boolean(albumId);
    if (!returnedToIndex) return undefined;
    const frame = window.requestAnimationFrame(() => indexHeadingRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [active, albumId]);

  if (!active) return null;

  const routeAlbum = albumId ? albums.find(item => item.id === albumId) : null;
  if (albumId && !routeAlbum) {
    const title = result.status === 'ready'
      ? 'Album not found'
      : result.status === 'error' ? 'Photo archive unavailable' : 'Opening album…';
    return <section className="gallery-scene gallery-scene--status" aria-label={title}>
      <SceneHeader breadcrumb="pictures/" title={title} onBack={() => navigate('/gallery')} />
      <ResourceState resource={result} loadingText="Connecting to the photo archive…" empty={false}>
        <p className="gallery-scene__empty" role="status">This album is not in the photo archive.</p>
      </ResourceState>
    </section>;
  }

  // With one album, its photo deck is the Pictures landing view. The album URL
  // remains a valid deep link, while the direct deck removes an extra click.
  const album = routeAlbum ?? (!albumId && albums.length === 1 ? albums[0] : null);
  if (album) {
    const selectedIndex = restorePhotoIndex(selectionByAlbum, album.id, album.photos?.length ?? 0);
    return <AlbumScene
      key={album.id}
      album={album}
      resource={result}
      active={active}
      selectedIndex={selectedIndex}
      onSelect={index => setSelectionByAlbum(current => ({ ...current, [album.id]: index }))}
      onBack={albums.length > 1 ? () => navigate('/gallery') : undefined}
    />;
  }

  const items = albumItems(albums);
  const selectedId = items.some(item => item.id === selectedAlbumId) ? selectedAlbumId : items[0]?.id ?? null;
  return <ResourceState resource={result} loadingText="Connecting to the photo archive…">
    <section className="gallery-scene" aria-label="Photo albums">
      <SceneHeader breadcrumb="pictures/" title="Pictures" headingRef={indexHeadingRef} />
      <p className="gallery-scene__note">A few frames from away from the keyboard.</p>
      {items.length
        ? <CardDeck
            items={items}
            selectedId={selectedId}
            onSelect={setSelectedAlbumId}
            onActivate={id => navigate(`/gallery/${encodeURIComponent(id)}`)}
            label="Photo albums"
            renderVisual={item => <Thumbnail key={item.album.photos?.[0]?.thumb ?? ''} source={item.album.photos?.[0]?.thumb} />}
          />
        : <p className="gallery-scene__empty" role="status">No photos are available yet.</p>}
    </section>
  </ResourceState>;
}
