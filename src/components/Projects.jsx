import React from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';

const Projects = () => (
  <section id="projects" className="section">
    <div className="container">
      <div className="section-head reveal">
        <div className="mono-label num">§ 04</div>
        <h2>
          Work <em>— recent</em>
        </h2>
      </div>
      <div className="work-grid">
        <div className="mono-label">
          Projects
          <br />
          2024 — 2026
        </div>
        <div className="work-list">
          {projects.map((project) => (
            <article key={project.github} className="work-item reveal">
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
                  {project.blog && (
                    <Link className="read" to={`/blog/${project.blog}`}>
                      Case study →
                    </Link>
                  )}
                  <a
                    className="read"
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub →
                  </a>
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
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Projects;
