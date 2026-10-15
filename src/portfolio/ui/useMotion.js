import { useEffect, useState } from 'react';

export function useMotion(preferences) {
  const [requested, setRequested] = useState(() => preferences.read('portfolio:motion') !== false);
  const [query] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)'));
  const [reduced, setReduced] = useState(query.matches);
  useEffect(() => {
    const change = event => setReduced(event.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, [query]);
  return {
    motion: requested && !reduced,
    reduced,
    toggle: () => { preferences.write('portfolio:motion', !requested); setRequested(!requested); },
  };
}
