import React from 'react';
import { motion } from 'framer-motion';
import { aboutData } from '../data/aboutData';


const About = () => {
  return (
    <section id="about" className="section">
      <div className="container">
        <motion.div
          className="section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mono-label num">§ 01</div>
          <h2>
            About <em>- Me</em>
          </h2>
        </motion.div>
        <div className="about-grid">
          <motion.div
            className="mono-label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Note
          </motion.div>
          <motion.div
            className="body"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {aboutData.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            <p>
              Check out some of my{' '}
              <a href="https://github.com/Shangmin-Chen" target="_blank" rel="noopener noreferrer">
                work
              </a>
              .
            </p>
            <p>
              If you want to chat about anything, don't hesistate to{' '}
              <a href="#contact">reach out</a>!
            </p>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
