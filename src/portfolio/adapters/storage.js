export function browserStorage(getStorage) {
  return {
    read(key) {
      try { return JSON.parse(getStorage().getItem(key)); } catch { return null; }
    },
    write(key, value) {
      try { getStorage().setItem(key, JSON.stringify(value)); } catch { /* Storage is optional. */ }
    },
  };
}
