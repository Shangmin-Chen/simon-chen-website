import React from 'react';
import { experiences } from '../data/experiences';

const Experience = () => {
  const [expanded, setExpanded] = React.useState(() => new Set());
  const baseId = React.useId();

  const toggle = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <section id="experience" className="section">
      <div className="container">
        <div className="section-head reveal">
          <div className="mono-label num">§ 03</div>
          <h2>
            Experience <em>— curated</em>
          </h2>
        </div>
        <ul className="exp-list">
          {experiences.map((exp, index) => {
            const rowKey = `${exp.mono}-${exp.title}-${exp.company}`;
            const isExpanded = expanded.has(rowKey);
            const panelId = `${baseId}-panel-${index}`;
            const triggerId = `${baseId}-trigger-${index}`;
            return (
              <li key={rowKey} className="exp-row reveal" style={{ '--delay': `${index * 60}ms` }}>
                <button
                  type="button"
                  id={triggerId}
                  className="exp-header-btn"
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  onClick={() => toggle(rowKey)}
                >
                  <span className="mono-label">{exp.mono}</span>
                  <span className="exp-middle">
                    <span className="role">
                      {exp.title} <em>· {exp.roleEm}</em>
                    </span>
                  </span>
                  <span className="where">
                    {exp.where}
                    <span className="exp-expand-hint" aria-hidden="true">
                      {isExpanded ? '−' : '+'}
                    </span>
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  hidden={!isExpanded}
                  className="exp-detail"
                >
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
