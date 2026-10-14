import { useState } from 'react';
import { Link } from 'react-router';
import { imageUrl } from '../../../data/galleryData';
import Lightbox from '../../../components/Lightbox';
import { useResource } from '../../application/useResource';
import { photoAlt } from '../../domain/photos';
import ResourceState from '../ResourceState';

function Photo({ photo }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="photo-unavailable">Photo unavailable</span> : <img src={imageUrl(photo.thumb || photo.full)} alt={photoAlt(photo)} loading="lazy" onError={() => setFailed(true)} />;
}

function Album({ album }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const photos = album.photos ?? [];
  return <>
    <Link className="inline-link" to="/gallery">← all albums</Link>
    <h2 className="section-heading">{album.title}</h2>
    {album.description && <p className="terminal-note">{album.description}</p>}
    {!photos.length && <p className="terminal-note">No photos here yet.</p>}
    <div className="terminal-photo-grid">{photos.map((photo, index) => <button type="button" key={photo.full} onClick={() => setLightboxIndex(index)} aria-label={`Open photo ${index + 1}: ${photo.caption || photo.alt || 'Photograph'}`}>
      <Photo photo={photo} /><span>{String(index + 1).padStart(2, '0')} / {photo.caption || photo.alt || 'Photograph'}</span>
    </button>)}</div>
    {lightboxIndex !== null && <Lightbox photos={photos} index={lightboxIndex} onIndex={setLightboxIndex} onClose={() => setLightboxIndex(null)} />}
  </>;
}

export default function Pictures({ resource, active, albumId }) {
  const result = useResource(resource, active);
  const albums = result.data?.galleries ?? [];
  const album = albums.find(item => item.id === albumId);
  return <ResourceState resource={result} loadingText="Connecting to the photo archive…" empty={!albums.length && !albumId}>
    {album ? <Album key={album.id} album={album} /> : albumId ? <><h2 className="section-heading">Album not found</h2><Link to="/gallery">← all albums</Link></> : <>
      <h2 className="section-heading">pictures/</h2>
      <p className="terminal-note">A few frames from away from the keyboard.</p>
      <div className="album-files">{albums.map(item => <Link className="album-file" key={item.id} to={`/gallery/${encodeURIComponent(item.id)}`}><span aria-hidden="true">├─ </span>{item.title}<small>{item.photos?.length ?? 0} frames ↗</small></Link>)}</div>
    </>}
  </ResourceState>;
}
