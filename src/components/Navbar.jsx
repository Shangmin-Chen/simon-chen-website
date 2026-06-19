import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scrollToSection } from '../utils/scrollUtils';
import { useTheme } from '../contexts/ThemeContext';
import { navbarData } from '../data/navbarData';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  // Close mobile menu when viewport widens past 768px so the backdrop/scroll-lock
  // cannot persist at desktop widths where the hamburger button is hidden.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 769px)');
    const handleWidthChange = (e) => {
      if (e.matches) setIsMenuOpen(false);
    };
    mql.addEventListener('change', handleWidthChange);
    return () => mql.removeEventListener('change', handleWidthChange);
  }, []);

  const handleScrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    } else {
      scrollToSection(sectionId);
    }
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar-shell">
      <nav className="navbar" aria-label="Site">
        <div className="nav-container">
          <button
            type="button"
            className="nav-logo"
            onClick={handleLogoClick}
            aria-label="Simon Chen — home"
          >
            {navbarData.logo}
          </button>

          <div
            id="primary-navigation"
            className={`nav-menu ${isMenuOpen ? 'active' : ''}`}
          >
            {navbarData.navLinks.map((link) => (
              <button
                key={link.sectionId}
                type="button"
                onClick={() => handleScrollToSection(link.sectionId)}
                className="nav-link"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="nav-controls">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className={`toggle-icon ${isDarkMode ? 'moon' : 'sun'}`}>
                {isDarkMode ? '🌙' : '☀️'}
              </span>
              <span
                className={`toggle-slider ${isDarkMode ? 'active' : ''}`}
                aria-hidden
              />
            </button>

            <button
              type="button"
              className={`nav-toggle ${isMenuOpen ? 'nav-toggle--open' : ''}`}
              onClick={() => setIsMenuOpen((o) => !o)}
              aria-expanded={isMenuOpen}
              aria-controls="primary-navigation"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
            </button>
          </div>
        </div>
      </nav>
      <button
        type="button"
        className={`nav-backdrop ${isMenuOpen ? 'nav-backdrop--visible' : ''}`}
        aria-hidden={!isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={() => setIsMenuOpen(false)}
      />
    </header>
  );
};

export default Navbar;
