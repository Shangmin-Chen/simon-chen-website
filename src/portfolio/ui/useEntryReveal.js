import { useCallback, useState } from 'react';

export default function useEntryReveal(motion, animationName) {
  const [entry, setEntry] = useState(() => ({ motion, entering: motion }));
  if (entry.motion !== motion) {
    setEntry({ motion, entering: motion && entry.entering });
  }

  const handleAnimationEnd = useCallback(event => {
    if (event.target === event.currentTarget && event.animationName === animationName) {
      setEntry(current => current.entering ? { ...current, entering: false } : current);
    }
  }, [animationName]);

  return { entering: motion && entry.entering, handleAnimationEnd };
}
