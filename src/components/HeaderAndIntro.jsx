import React from 'react';

const HeaderAndIntro = () => {
  return (
    <>
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
    </>
  );
};

export default HeaderAndIntro;
