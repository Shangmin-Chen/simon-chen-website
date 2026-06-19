import { useState, useEffect } from 'react';
import { githubData } from '../data/githubData';

const USERNAME = githubData.username;
const CACHE_KEY = `gh-contrib:${USERNAME}`;

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

async function fetchContributions() {
  // Same-origin proxy (Cloudflare Worker) — avoids browser CORS against the
  // upstream contributions API and serves an edge-cached response.
  const res = await fetch('/api/github-contributions');
  if (!res.ok) {
    throw new Error('Failed to fetch contributions');
  }
  const data = await res.json();

  if (!data || !Array.isArray(data.contributions)) {
    throw new Error('Failed to fetch contributions');
  }

  const total =
    data.total?.lastYear ??
    Object.values(data.total ?? {}).reduce((sum, n) => sum + n, 0);

  return { days: data.contributions, total };
}

const useGithubContributions = () => {
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
    inflight = inflight ?? fetchContributions();
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
    days: data?.days ?? [],
    total: data?.total ?? 0,
    loading,
    error
  };
};

export default useGithubContributions;
