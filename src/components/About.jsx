import React from 'react';
import { aboutData } from '../data/aboutData';
import { skills } from '../data/skills';
import Tag from './ui/Tag';
import { scrollToSection } from '../utils/scrollUtils';

const About = () => {
  return (
    <section id="about" className="section">
      <div className="container">
        <div className="section-head reveal">
          <div className="mono-label num">§ 01</div>
          <h2>
            About <em>- Me</em>
          </h2>
        </div>
        <div className="about-grid">
          <div className="mono-label reveal">Note</div>
          <div className="body reveal" style={{ '--delay': '80ms' }}>
            {aboutData.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            <p>
              Check out some of my{' '}
              <a href="https://github.com/Shangmin-Chen" target="_blank" rel="noopener noreferrer">
                projects on GitHub
              </a>
              , and I often think out loud on{' '}
              <a href="https://x.com/simonchen0" target="_blank" rel="noopener noreferrer">
                X
              </a>
              . If you want to talk — about anything, any discipline —{' '}
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('contact');
                }}
              >
                reach out
              </a>{' '}
              and let's find time to chat.
            </p>
            <div className="skills">
              <h3>{aboutData.skillsTitle}</h3>
              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <Tag key={index} variant="skill">
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
