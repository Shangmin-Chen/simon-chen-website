import { useState, useEffect } from 'react';
import sessionCache from '../utils/sessionCache';

const CACHE_KEY = 'gallery:manifest:v2';
const CACHE_TTL_MS = 5 * 60 * 1000;

// Cache shared across every mount in this page session so navigating back to
// the gallery is instant and never refires the request. `memoryCache` survives
// remounts; `sessionStorage` survives reloads within the same tab session,
// expiring after CACHE_TTL_MS (aligned with the Worker's edge cache).
let memoryCache = null;
let inflight = null;

async function fetchManifest() {
  // Same-origin proxy (Cloudflare Worker) — fetches gallery.json from the
  // public R2 domain and edge-caches it, so the client stays same-origin
  // (no CORS) and we don't refetch from R2 on every visit.
  const res = await fetch('/api/gallery');
  if (!res.ok) {
    throw new Error('Failed to load gallery');
  }
  const data = await res.json();

  if (!data || !Array.isArray(data.galleries)) {
    throw new Error('Failed to load gallery');
  }

  return { galleries: data.galleries };
}

const useGallery = () => {
  const cached = memoryCache ?? sessionCache.read(CACHE_KEY, CACHE_TTL_MS);
  const [data, setData] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (memoryCache) return;

    const sessionCached = sessionCache.read(CACHE_KEY, CACHE_TTL_MS);
    if (sessionCached) {
      memoryCache = sessionCached;
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    // Dedupe concurrent mounts onto a single request.
    inflight =
      inflight ??
      fetchManifest().catch((err) => {
        inflight = null;
        throw err;
      });
    inflight
      .then((result) => {
        memoryCache = result;
        sessionCache.write(CACHE_KEY, result);
        if (active) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      })
      .finally(() => {
        inflight = null;
      });

    return () => {
      active = false;
    };
  }, []);

  const galleries = data?.galleries ?? [];
  const featured = galleries.find((g) => g.featured) ?? galleries[0] ?? null;

  return { galleries, featured, loading, error };
};

export default useGallery;
