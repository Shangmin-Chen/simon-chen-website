import { useState, useEffect } from 'react';

const HANDLE = 'simonlovestocode';
// -v2 suffix invalidates pre-proxy sessionStorage entries (old shape).
const CACHE_KEY = `cf-data:${HANDLE}-v2`;
const CACHE_TTL_MS = 60 * 60 * 1000;

// Cache shared across every mount in this page session so re-opening the
// preview is instant and never refires the API. `memoryCache` survives
// remounts; `sessionStorage` survives reloads within the same tab session.
let memoryCache = null;
let inflight = null;

function readSessionCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Tolerate corrupt or stale entries gracefully.
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.contests) ||
      typeof parsed.cachedAt !== 'number' ||
      Date.now() - parsed.cachedAt > CACHE_TTL_MS
    ) {
      return null;
    }
    return parsed;
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

async function fetchCodeforces() {
  const res = await fetch('/api/codeforces');
  if (!res.ok) {
    throw new Error('Failed to fetch contest history');
  }
  const payload = await res.json();
  if (!payload || typeof payload !== 'object') {
    throw new Error('Failed to fetch contest history');
  }

  const ratings = Array.isArray(payload.ratings) ? payload.ratings : [];
  const contests = [...ratings].sort(
    (a, b) => b.ratingUpdateTimeSeconds - a.ratingUpdateTimeSeconds
  );

  return { contests, userInfo: payload.user ?? null, cachedAt: Date.now() };
}

const useCodeforcesData = () => {
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
    inflight = inflight ?? fetchCodeforces();
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
    contests: data?.contests ?? [],
    userInfo: data?.userInfo ?? null,
    loading,
    error,
  };
};

export default useCodeforcesData;
