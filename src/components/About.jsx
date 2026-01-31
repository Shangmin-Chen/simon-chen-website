import React from 'react';
import { scrollToSection } from '../utils/scrollUtils';
import { aboutData } from '../data/aboutData';
import { skills } from '../data/skills';
import Tag from './ui/Tag';
import Button from './ui/Button';

const About = () => {
  const handleScrollToSection = (sectionId) => {
    scrollToSection(sectionId);
  };

  return (
    <section id="about" className="section">
      <div className="container">
        <h2 className="section-title">About Me</h2>
        <div className="about-content">
          <div className="about-text">
            {aboutData.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            <div className="about-actions">
              <Button 
                variant="secondary" 
                onClick={() => handleScrollToSection(aboutData.buttonAction)}
              >
                {aboutData.buttonText}
              </Button>
            </div>
            
            <div className="skills">
              <h3>{aboutData.skillsTitle}</h3>
              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <Tag key={index} variant="skill">{skill}</Tag>
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
