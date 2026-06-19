import React from 'react';

const InstagramPreview = () => {
  return (
    <div className="ig-preview">
      <div 
        className="ig-preview-content" 
        style={{ 
          fontSize: '1rem', 
          color: 'var(--text-secondary)', 
          lineHeight: 1.5, 
          marginBottom: '1rem',
          maxWidth: '50ch'
        }}
      >
        follow me on instagram!
      </div>
      <div className="ig-preview-foot">
        <a
          href="https://www.instagram.com/the.simonchen/"
          target="_blank"
          rel="noopener noreferrer"
          className="cf-profile-link"
          aria-label="@the.simonchen on Instagram"
        >
          @the.simonchen
        </a>
      </div>
    </div>
  );
};

export default InstagramPreview;
