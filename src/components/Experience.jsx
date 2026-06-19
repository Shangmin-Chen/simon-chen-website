import React from 'react';
import { experiences } from '../data/experiences';

const Experience = () => {
  return (
    <section id="experience" className="section">
      <div className="container">
        <div className="section-head reveal">
          <div className="mono-label num">§ 03</div>
          <h2>
            Experience <em>- Curated</em>
          </h2>
        </div>
        <ul className="exp-list">
          {experiences.map((exp, index) => {
            const rowKey = `${exp.mono}-${exp.title}-${exp.company}`;
            return (
              <li key={rowKey} className="exp-row reveal" style={{ '--delay': `${index * 60}ms` }}>
                <div className="exp-header">
                  <span className="mono-label">{exp.mono}</span>
                  <span className="exp-middle">
                    <span className="role">
                      {exp.title} <em>· {exp.roleEm}</em>
                    </span>
                  </span>
                  <span className="where">{exp.where}</span>
                </div>
                <div className="exp-detail">
                  <p className="exp-period">{exp.period}</p>
                  <p className="exp-desc">{exp.description}</p>
                  {exp.technologies?.length > 0 && (
                    <div className="exp-tags">
                      {exp.technologies.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default Experience;

