import React from 'react';
import SparkBytesImage from '../images/SparkBytes.png';

const ProjectsSection = () => {
  return (
    <section className="projects-section" id="projects">
      <h2>Projects</h2>
      <p>Check out some of my work below:</p>
      <div className="projects-list">
        <div className="project-item">
          <div className="media-placeholder">
            <img src={SparkBytesImage} alt="Spark Bytes" />
          </div>
          <h3>Spark Bytes</h3>
          <p>Spark Bytes is a web app for Boston University students and faculty to share events with free food, reducing food waste and promoting sustainability by making surplus food accessible to the BU community.</p>
          <a href="https://github.com/Shangmin-Chen/Spark-Bytes" target="_blank" rel="noopener noreferrer">Visit this project</a>
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
        {/* ...existing project items... */}
      </div>
    </section>
  );
};

export default ProjectsSection;
