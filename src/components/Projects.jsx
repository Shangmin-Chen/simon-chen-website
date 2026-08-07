import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projects } from '../data/projects';

const Projects = () => {
  const [canHover, setCanHover] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(hover: hover)');
    const handleChange = (e) => setCanHover(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return (
    <section id="projects" className="section">
      <div className="container">
        <motion.div
          className="section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mono-label num">§ 04</div>
          <h2>
            Projects <em>- Recent</em>
          </h2>
        </motion.div>
        <div className="work-grid">
          <div className="mono-label"></div>
          <div className="work-list">
            {projects.map((project, index) => (
              <motion.article
                key={project.title}
                className="work-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={canHover ? { y: -6, transition: { duration: 0.2 } } : undefined}
              >
              <div>
                <h3 className="title">
                  {project.titleParts.before}
                  <em>{project.titleParts.em}</em>
                  {project.titleParts.after}
                </h3>
                <span className="title-plain">{project.title}</span>
                <p className="desc">{project.description}</p>
                <div className="tags">
                  {project.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="right">
                <dl>
                  <dt>Year</dt>
                  <dd>{project.meta.year}</dd>
                  <dt>Role</dt>
                  <dd>{project.meta.role}</dd>
                  <dt>Status</dt>
                  <dd>{project.meta.status}</dd>
                </dl>
                <div className="read-row">
                  {project.github && (
                    <a
                      className="read"
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub →
                    </a>
                  )}
                  {project.demo && (
                    <a
                      className="read"
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live →
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
};

export default Projects;
