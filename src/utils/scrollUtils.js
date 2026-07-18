/**
 * Utility functions for smooth scrolling using the native scroll API.
 */

/**
 * Returns true when the user has opted into reduced motion.
 * @returns {boolean}
 */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Extra breathing room below the fixed navbar, in px.
const NAV_BREATHING_ROOM = 16;

/**
 * Scroll to a specific section.
 * Uses instant scrolling when reduced motion is preferred.
 * @param {string} sectionId - The ID of the section to scroll to
 */
export const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (!element) return;

  const navbar = document.querySelector('.navbar');
  const navOffset = (navbar?.getBoundingClientRect().height ?? 0) + NAV_BREATHING_ROOM;
  const top = element.getBoundingClientRect().top + window.scrollY - navOffset;
  window.scrollTo({
    top,
    behavior: prefersReducedMotion() ? 'instant' : 'smooth',
  });
};

/**
 * Scroll to top of the page.
 * Uses instant scrolling when reduced motion is preferred.
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion() ? 'instant' : 'smooth',
  });
};
