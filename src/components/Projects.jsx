import React from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import Card from './ui/Card';
import Tag from './ui/Tag';

const Projects = () => {
  return (
    <section id="projects" className="section">
      <div className="container">
        <h2 className="section-title">Projects</h2>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <Card key={index} variant="default">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>
              <div className="project-links">
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                  GitHub
                </a>
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer" className="project-link">
                    Live Demo
                  </a>
                )}
                {project.blog && (
                  <Link to={`/blog/${project.blog}`} className="project-link">
                    Read More
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
