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

/**
 * Scroll to a specific section.
 * Uses instant scrolling when reduced motion is preferred.
 * @param {string} sectionId - The ID of the section to scroll to
 */
export const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (!element) return;

  // Land the section flush against the navbar — each section already has its
  // own top padding, so no extra gap is added here (it would expose a sliver
  // of the previous, differently-colored section above the target's edge).
  const navbar = document.querySelector('.navbar');
  const navOffset = navbar?.getBoundingClientRect().height ?? 0;
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
