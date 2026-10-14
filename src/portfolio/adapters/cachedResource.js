// Resource port: getSnapshot / subscribe / load. TTL applies to memory as well
// as storage; in-flight work is shared even across StrictMode remounts.
export function createCachedResource({ key, ttl, fetchData, storage, now = Date.now, valid }) {
  const stored = storage?.read(key);
  let cached = stored?.version === 1 && valid(stored.data) && Number.isFinite(stored.time) && stored.time <= now() && now() - stored.time < ttl ? stored : null;
  let snapshot = { data: cached?.data ?? null, status: cached ? 'ready' : 'idle', error: null };
  let inflight = null;
  const listeners = new Set();
  const publish = next => {
    snapshot = next;
    listeners.forEach(listener => listener());
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    load() {
      if (cached && now() - cached.time < ttl) return Promise.resolve(cached.data);
      if (inflight) return inflight;
      publish({ data: snapshot.data, status: 'loading', error: null });
      inflight = Promise.resolve().then(fetchData).then(data => {
        if (!valid(data)) throw new Error('The response could not be read.');
        cached = { version: 1, time: now(), data };
        storage?.write(key, cached);
        publish({ data, status: 'ready', error: null });
        return data;
      }).catch(error => {
        publish({ data: snapshot.data, status: 'error', error: error.message || 'Connection failed.' });
        return null;
      }).finally(() => { inflight = null; });
      return inflight;
    },
  };
}
