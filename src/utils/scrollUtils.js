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

// ~--nav-height at 18px root (4.5rem); leaves room below the fixed navbar.
const NAV_OFFSET = 81;

/**
 * Scroll to a specific section.
 * Uses instant scrolling when reduced motion is preferred.
 * @param {string} sectionId - The ID of the section to scroll to
 */
export const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
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
