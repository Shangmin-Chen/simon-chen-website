import { useState, useEffect } from 'react';
import { goodreadsData } from '../data/goodreadsData';
import sessionCache from '../utils/sessionCache';

const CACHE_KEY = `goodreads:${goodreadsData.userId}:${goodreadsData.shelf}:v2`;
const CACHE_TTL_MS = 60 * 60 * 1000;

// Cache shared across every mount in this page session so re-opening the
// preview is instant and never refires the API. `memoryCache` survives
// remounts; `sessionStorage` survives reloads within the same tab session,
// expiring after CACHE_TTL_MS (aligned with the Worker's edge cache).
let memoryCache = null;
let inflight = null;

async function fetchBooks() {
  // Same-origin proxy (Cloudflare Worker) — Goodreads only exposes an
  // RSS feed and it isn't CORS-enabled, so the Worker parses it to JSON.
  const res = await fetch('/api/goodreads');
  if (!res.ok) {
    throw new Error('Failed to fetch shelf');
  }
  const data = await res.json();

  if (!data || !Array.isArray(data.books)) {
    throw new Error('Failed to fetch shelf');
  }

  return { books: data.books };
}

const useGoodreads = () => {
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
    inflight = inflight ?? fetchBooks();
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

  return {
    books: data?.books ?? [],
    loading,
    error,
  };
};

export default useGoodreads;
