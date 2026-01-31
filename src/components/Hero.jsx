import React from 'react';
import { scrollToSection } from '../utils/scrollUtils';
import { heroData } from '../data/heroData';
import Button from './ui/Button';

const Hero = () => {
  const handleScrollToSection = (sectionId) => {
    scrollToSection(sectionId);
  };

  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero-content">
        <h1 className="hero-title">
          {heroData.greeting} <span className="highlight">{heroData.name}</span>
        </h1>
        <h2 className="hero-subtitle">
          {heroData.subtitle}
        </h2>
        <p className="hero-description">
          {heroData.description}
        </p>
        <div className="hero-buttons">
          {heroData.buttons.map((button) => (
            <Button 
              key={button.action}
              variant={button.variant} 
              onClick={() => handleScrollToSection(button.action)}
            >
              {button.text}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;