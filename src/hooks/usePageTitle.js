import { useEffect } from 'react';

// Per-route document titles. Restores whatever the tab showed before this
// page mounted, so leaving a route returns to the static index.html title.
const usePageTitle = (title) => {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · Simon Chen` : 'Simon Chen';
    return () => {
      document.title = previous;
    };
  }, [title]);
};

export default usePageTitle;
