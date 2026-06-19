import React, { useId, useState } from 'react';
import { nowData } from '../data/nowData';
import CodeforcesPreview from './CodeforcesPreview';
import GitHubPreview from './GitHubPreview';
import GoodreadsPreview from './GoodreadsPreview';
import InstagramPreview from './InstagramPreview';

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
        <div className="section-head reveal">
          <div className="mono-label num">§ 02</div>
          <h2>
            Now <em>— currently</em>
          </h2>
        </div>
        <div className="now-grid">
          <div className="mono-label reveal">{nowData.note}</div>
          <ul className="now-list">
            {nowData.items.map((item, i) => {
              const isExpandable = Boolean(item.expand);
              const isExpanded = expanded.has(item.label);
              const panelId = `${baseId}-now-${i}`;
              return (
                <li
                  key={item.label}
                  className={`now-item reveal${isExpandable ? ' now-item--expandable' : ''}`}
                  style={{ '--delay': `${i * 80}ms` }}
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
                        {isExpanded && item.expand === 'instagram' && <InstagramPreview />}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Now;
