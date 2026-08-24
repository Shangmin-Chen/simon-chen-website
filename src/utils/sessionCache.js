const sessionCache = {
  read(key, maxAgeMs) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (!entry || entry.v !== 1 || typeof entry.t !== 'number') return null;
      if (Date.now() - entry.t > maxAgeMs) return null;
      return entry.d ?? null;
    } catch {
      return null;
    }
  },

  write(key, data) {
    try {
      sessionStorage.setItem(key, JSON.stringify({ v: 1, t: Date.now(), d: data }));
    } catch {
      // sessionStorage unavailable (private mode / quota)
    }
  },
};

export default sessionCache;
