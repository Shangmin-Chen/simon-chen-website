import React from 'react';

const XPreview = () => {
  return (
    <div className="x-preview">
      <div
        className="x-preview-content"
        style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '1rem',
          maxWidth: '50ch'
        }}
      >
        follow me on X
      </div>
      <div className="x-preview-foot">
        <a
          href="https://x.com/simonchen0"
          target="_blank"
          rel="noopener noreferrer"
          className="cf-profile-link"
          aria-label="@simonchen0 on X"
        >
          @simonchen0
        </a>
      </div>
    </div>
  );
};

export default XPreview;
