import React from 'react';
import Navbar from './Navbar'; // Import the new Navbar component
import Footer from './Footer'; // Import the new Footer component
import '../App.css'; // Updated import

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <header className="landing-header" id="about">
        <h1>Shangmin Chen</h1>
        <p>A passionate developer and lifelong learner.</p>
      </header>
      <section className="intro-section">
        <div className="intro-content">
          <h2>Who I Am</h2>
          <p>
            I specialize in building modern web applications and love exploring new technologies. Scroll down to learn more about my work and get in touch.
          </p>
        </div>
        <div className="intro-media">
          {/* Placeholder for a video or image */}
          <div className="media-placeholder">
            <span>*placeholder for image or video*</span>
          </div>
        </div>
      </section>
      <section className="about-section">
        <h2>About Me</h2>
        <p>
          I'm a developer with a focus on creating efficient, user-friendly web applications. I'm constantly learning and experimenting with new tools and technologies to improve my craft.
        </p>
      </section>
      <section className="projects-section" id="projects">
        <h2>Projects</h2>
        <p>Check out some of my work below:</p>
        <div className="projects-list">
          <div className="project-item">
            <div className="media-placeholder">
              <span>*image*</span>
            </div>
            <h3>Project 1</h3>
            <p>A brief description of Project 1.</p>
            <a href="https://github.com/your-username/project-1" target="_blank" rel="noopener noreferrer">Visit this project</a>
          </div>
          <div className="project-item">
            <div className="media-placeholder">
              <span>*image*</span>
            </div>
            <h3>Project 2</h3>
            <p>A brief description of Project 2.</p>
            <a href="https://github.com/your-username/project-2" target="_blank" rel="noopener noreferrer">Visit this project</a>
          </div>
          <div className="project-item">
            <div className="media-placeholder">
              <span>*image*</span>
            </div>
            <h3>Project 3</h3>
            <p>A brief description of Project 3.</p>
            <a href="https://github.com/your-username/project-3" target="_blank" rel="noopener noreferrer">Visit this project</a>
          </div>
          <div className="project-item">
            <div className="media-placeholder">
              <span>*image*</span>
            </div>
            <h3>Project 3</h3>
            <p>A brief description of Project 3.</p>
            <a href="https://github.com/your-username/project-3" target="_blank" rel="noopener noreferrer">Visit this project</a>
          </div>
          <div className="project-item">
            <div className="media-placeholder">
              <span>*image*</span>
            </div>
            <h3>Project 3</h3>
            <p>A brief description of Project 3.</p>
            <a href="https://github.com/your-username/project-3" target="_blank" rel="noopener noreferrer">Visit this project</a>
          </div>
          <div className="project-item">
            <div className="media-placeholder">
              <span>*image*</span>
            </div>
            <h3>Project 3</h3>
            <p>A brief description of Project 3.</p>
            <a href="https://github.com/your-username/project-3" target="_blank" rel="noopener noreferrer">Visit this project</a>
          </div>
        </div>
      </section>
      <section className="contact-section" id="contact">
        <h2>Contact</h2>
        <p>Feel free to reach out to me at <a href="mailto:your-email@example.com">your-email@example.com</a>.</p>
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;