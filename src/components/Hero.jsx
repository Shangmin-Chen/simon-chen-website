import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { scrollToSection } from '../utils/scrollUtils';
import { heroData } from '../data/heroData';
import Button from './ui/Button';
import SocialLinks from './ui/SocialLinks';
import BlurhashImage from './ui/BlurhashImage';

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
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
          >
            {heroData.metaLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </motion.div>
        )}
        <motion.h1
          className="hero-title-v2"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        >
          {heroData.headlineLines.map((line) => (
            <React.Fragment key={line}>
              {line}
              <br />
            </React.Fragment>
          ))}
          {heroData.headlineBeforeEm}
          <em className="accent">{heroData.headlineEm}</em>
        </motion.h1>
        <div className="hero-lower-grid">
          <div className="hero-desc-col">
            <motion.p
              className="hero-lede-v2"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
            >
              {heroData.lede}
            </motion.p>
            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.38 }}
            >
              {heroData.buttons.map((button) => (
                <Button
                  key={button.action}
                  variant={button.variant}
                  onClick={() => handleScrollToSection(button.action)}
                >
                  {button.text}
                </Button>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            >
              <SocialLinks className="social-links hero-social" linkClassName="social-link" />
            </motion.div>
          </div>

          <motion.div
            className="hero-avatar-col"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            <div className="hero-avatar-frame">
              <BlurhashImage
                src="https://images.simon-chen.com/shanghai/shanghai_08-full.jpg"
                blurhash="LE9@L;4n00~p00?b?b9F.8M{RPo#"
                alt="Simon Chen"
                className="hero-avatar-img-container"
                imgClassName="hero-avatar-img"
              />
              <Link to="/gallery/shanghai-study-abroad" className="hero-avatar-caption-link">
                Shanghai Study Abroad
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
