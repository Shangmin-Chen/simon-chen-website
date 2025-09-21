import React from 'react';
import { scrollToSection } from '../utils/scrollUtils';

const Hero = () => {
  const handleScrollToSection = (sectionId) => {
    scrollToSection(sectionId);
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Hello, I'm <span className="highlight">Shangmin Chen</span>
        </h1>
        <p className="hero-subtitle">
          Software Engineer
        </p>
        <p className="hero-description">
          I build beautiful applications with ML and AI when I see a need or problem worth solving.
        </p>
        <div className="hero-buttons">
          <button 
            className="btn btn-primary" 
            onClick={() => handleScrollToSection('projects')}
          >
            View My Work
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => handleScrollToSection('contact')}
          >
            Get In Touch
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
