import { useState, useEffect } from 'react';

const HANDLE = 'simonlovestocode';
const CACHE_KEY = `cf-data:${HANDLE}`;

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

async function fetchCodeforces() {
  const [contestsRes, infoRes] = await Promise.all([
    fetch(`https://codeforces.com/api/user.rating?handle=${HANDLE}`),
    fetch(`https://codeforces.com/api/user.info?handles=${HANDLE}`),
  ]);
  const contestsData = await contestsRes.json();
  const infoData = await infoRes.json();

  if (contestsData.status !== 'OK') {
    throw new Error('Failed to fetch contest history');
  }

  const contests = [...contestsData.result].sort(
    (a, b) => b.ratingUpdateTimeSeconds - a.ratingUpdateTimeSeconds
  );
  const userInfo = infoData.status === 'OK' ? infoData.result?.[0] ?? null : null;

  return { contests, userInfo };
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount loading state
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
