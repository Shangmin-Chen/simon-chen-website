import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { scrollToSection } from '../utils/scrollUtils';
import { heroData } from '../data/heroData';
import { githubData } from '../data/githubData';
import useContributionWindow from '../hooks/useContributionWindow';
import Button from './ui/Button';
import SocialLinks from './ui/SocialLinks';
import BlurhashImage from './ui/BlurhashImage';
import ContributionShip from './ContributionShip';

const EASE = [0.16, 1, 0.3, 1];

const Hero = () => {
  const { contributions } = useContributionWindow();

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

        {/* Spans the full content width, the way the headline it replaces did —
            it is what carries the eye across the gap between the two columns. */}
        <motion.h1
          className="hero-claim"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
        >
          {heroData.headline.lead} <em className="accent">{heroData.headline.accent}</em>
        </motion.h1>


        {/* The plate's title block, run full width as the sheet's masthead —
            it and the claim above are what carry the eye across the drawing
            area's two halves. */}
        <motion.dl
          className="hero-masthead"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        >
          <div className="cs-tb-cell">
            <dt>{githubData.ship.labels.vessel}</dt>
            <dd className="cs-vessel">
              {heroData.vessel.lead} <em className="accent">{heroData.vessel.accent}</em>
            </dd>
          </div>
          <div className="cs-tb-cell">
            <dt>{githubData.ship.labels.captain}</dt>
            <dd>
              <a
                href={githubData.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${githubData.handle} on GitHub`}
              >
                {githubData.handle}
              </a>
            </dd>
          </div>
          <div className="cs-tb-cell">
            <dt>{githubData.ship.labels.window}</dt>
            <dd>{contributions}</dd>
          </div>
        </motion.dl>

        <div className="hero-lower-grid">
          <motion.div
            className="hero-plate-col"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
          >
            <ContributionShip note={heroData.shipNote} />

            {/* Sits under the plate, not under the whole grid: the column is
                stretched to the prints' height, so a row below the grid floats
                far beneath the drawing it belongs to. */}
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
      </div>
    </section>
  );
};

export default Hero;
