import { useState, useEffect } from 'react';
import { goodreadsData } from '../data/goodreadsData';

const CACHE_KEY = `goodreads:${goodreadsData.userId}:${goodreadsData.shelf}`;

// Cache shared across every mount in this page session so re-opening the
// preview is instant and never refires the API. `memoryCache` survives
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
    inflight = inflight ?? fetchBooks();
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

  return {
    books: data?.books ?? [],
    loading,
    error,
  };
};

export default useGoodreads;
