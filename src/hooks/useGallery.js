import { useState, useEffect } from 'react';

const CACHE_KEY = 'gallery:manifest';

// Cache shared across every mount in this page session so navigating back to
// the gallery is instant and never refires the request. `memoryCache` survives
// remounts; `sessionStorage` survives reloads within the same tab session.
let memoryCache = null;
let inflight = null;

function readSessionCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSessionCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage unavailable (private mode / quota) — memoryCache still applies.
  }
}

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
  const cached = memoryCache ?? readSessionCache();
  const [data, setData] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (memoryCache) return;

    const sessionCached = readSessionCache();
    if (sessionCached) {
      memoryCache = sessionCached;
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    // Dedupe concurrent mounts onto a single request.
    inflight = inflight ?? fetchManifest();
    inflight
      .then((result) => {
        memoryCache = result;
        writeSessionCache(result);
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
