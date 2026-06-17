import { useEffect } from 'react';

const revealVisible = () => {
  document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      el.classList.add('revealed');
    }
  });
};

export const useScrollReveal = () => {
  useEffect(() => {
    // Run immediately to catch anything already in view
    revealVisible();
    window.addEventListener('scroll', revealVisible, { passive: true });
    return () => window.removeEventListener('scroll', revealVisible);
  }, []);

  // Re-run after every render to catch lazy-loaded elements
  // that mount after the initial scroll listener is attached
  useEffect(() => {
    revealVisible();
  });
};
