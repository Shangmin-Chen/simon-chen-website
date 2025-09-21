import React from 'react';

const About = () => {
  return (
    <section id="about" className="section">
      <div className="container">
        <h2 className="section-title">About Me</h2>
        <div className="about-content">
          <div className="about-text">
            <p>
              I build things when I see a need worth addressing, and I make them beautiful because I can.
            </p>
            <p>
              Full-stack developer with a passion for ML/AI integration. Always exploring new ways 
              to solve problems through elegant code and thoughtful design.
            </p>
            <div className="skills">
              <h3>Skills</h3>
              <div className="skills-grid">
                <span className="skill-tag">React</span>
                <span className="skill-tag">JavaScript</span>
                <span className="skill-tag">Python</span>
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">Machine Learning</span>
                <span className="skill-tag">AI Integration</span>
                <span className="skill-tag">Full-Stack Development</span>
                <span className="skill-tag">Git</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
