import { useEffect, useSyncExternalStore } from 'react';

export function useResource(resource, enabled = true) {
  const snapshot = useSyncExternalStore(resource.subscribe, resource.getSnapshot);
  useEffect(() => { if (enabled) void resource.load(); }, [resource, enabled]);
  return { ...snapshot, retry: resource.load };
}
