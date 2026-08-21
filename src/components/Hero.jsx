import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { scrollToSection } from '../utils/scrollUtils';
import { heroData } from '../data/heroData';
import Button from './ui/Button';
import SocialLinks from './ui/SocialLinks';
import BlurhashImage from './ui/BlurhashImage';
import ContributionShip from './ContributionShip';

const EASE = [0.16, 1, 0.3, 1];

const Hero = () => {
  const handleScrollToSection = (sectionId) => {
    scrollToSection(sectionId);
  };

  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero-content">
        {heroData.metaLines?.length > 0 && (
          <motion.div
            className="hero-meta mono-label"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
          >
            {heroData.metaLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </motion.div>
        )}

        <div className="hero-lower-grid">
          <motion.div
            className="hero-plate-col"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
          >
            <ContributionShip
              title={
                <h1 className="hero-vessel">
                  {heroData.vessel.lead} <em className="accent">{heroData.vessel.accent}</em>
                </h1>
              }
              description={<p className="hero-lede-v2">{heroData.shipNote}</p>}
            />
          </motion.div>

          <div className="hero-photos-col">
            <motion.div
              className="hero-photos-head"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            >
              <span className="mono-label">{heroData.album.label}</span>
              <Link to={heroData.album.to} className="hero-photos-link">
                {heroData.album.caption}
              </Link>
            </motion.div>

            <div className="hero-photo-stack">
              {heroData.photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  className={`hero-photo hero-photo--${photo.id}`}
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.34 + i * 0.09 }}
                >
                  <Link
                    to={heroData.album.to}
                    className="hero-photo-frame"
                    aria-label={`${photo.alt} — open the ${heroData.album.caption} album`}
                  >
                    <BlurhashImage
                      src={photo.src}
                      blurhash={photo.blurhash}
                      alt={photo.alt}
                      className="hero-photo-img-container"
                      imgClassName="hero-photo-img"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Spans both columns, so the calls to action close the hero across its
            full width rather than leaving the corner under the prints empty. */}
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
        >
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
          <SocialLinks className="social-links hero-social" linkClassName="social-link" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
