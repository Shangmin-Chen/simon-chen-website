import { useEffect, useRef } from 'react';

// Per-route document titles. Restores whatever the tab showed before this
// page mounted, so leaving a route returns to the static index.html title.
const usePageTitle = (title) => {
  const prevTitle = useRef(document.title);

  useEffect(() => {
    document.title = title ? `${title} · Simon Chen` : 'Simon Chen';
    return () => {
      document.title = prevTitle.current;
    };
  }, [title]);
};

export default usePageTitle;
