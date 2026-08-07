import React, { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { nowData } from '../data/nowData';
import CodeforcesPreview from './CodeforcesPreview';
import GitHubPreview from './GitHubPreview';
import GoodreadsPreview from './GoodreadsPreview';
import XPreview from './XPreview';

const Now = () => {
  const [expanded, setExpanded] = useState(() => new Set());
  const baseId = useId();

  const toggle = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <section id="now" className="section">
      <div className="container">
        <motion.div
          className="section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mono-label num">§ 02</div>
          <h2>
            Now <em>- Currently</em>
          </h2>
        </motion.div>
        <div className="now-grid">
          <motion.div
            className="mono-label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {nowData.note}
          </motion.div>
          <ul className="now-list">
            {nowData.items.map((item, i) => {
              const isExpandable = Boolean(item.expand);
              const isExpanded = expanded.has(item.label);
              const panelId = `${baseId}-now-${i}`;
              return (
                <motion.li
                  key={item.label}
                  className={`now-item${isExpandable ? ' now-item--expandable' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <span className="now-label">{item.label}</span>
                  <div className="now-right">
                    {isExpandable ? (
                      <button
                        type="button"
                        className="now-value now-value--toggle"
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                        onClick={() => toggle(item.label)}
                      >
                        {item.value}
                        <span className="now-expand-hint" aria-hidden="true">
                          {isExpanded ? '−' : '+'}
                        </span>
                      </button>
                    ) : (
                      <span className="now-value">{item.value}</span>
                    )}
                    {item.sub && <span className="now-sub">{item.sub}</span>}
                    {isExpandable && (
                      <div id={panelId} className="now-detail" hidden={!isExpanded}>
                        {isExpanded && item.expand === 'codeforces' && <CodeforcesPreview />}
                        {isExpanded && item.expand === 'github' && <GitHubPreview />}
                        {isExpanded && item.expand === 'goodreads' && <GoodreadsPreview />}
                        {isExpanded && item.expand === 'twitter' && <XPreview />}
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Now;
