import React, { useState, useEffect } from 'react';
import logo from '../images/logo64.png'; // Import the logo

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 50) {
        setIsVisible(false); // Hide navbar when scrolling down
        setShowBackToTop(true); // Show "Back to Top" button
      } else {
        setIsVisible(true); // Show navbar when at the top of the page
        setShowBackToTop(false); // Hide "Back to Top" button
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className={`navbar ${isVisible ? '' : 'navbar-hidden'}`}>
        <div className="navbar-logo">
          <a href="/" className="logo-link" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="Logo" className="logo" />
            <span>Shangmin Chen</span>
          </a>
        </div>
        <div className="navbar-links">
          <button onClick={() => scrollToSection('about')} className="navbar-link">About</button>
          <button onClick={() => scrollToSection('projects')} className="navbar-link">Projects</button>
          <button onClick={() => scrollToSection('contact')} className="navbar-link">Contact</button>
        </div>
        <div className="navbar-action">
          <button className="get-started-btn">Get in Touch</button>
        </div>
      </nav>
      {showBackToTop && (
        <button className="back-to-top-btn" onClick={scrollToTop}>
          ↑ Back to Top
        </button>
      )}
    </>
  );
};

export default Navbar;