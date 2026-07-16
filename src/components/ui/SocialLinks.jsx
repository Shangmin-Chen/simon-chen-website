import React from 'react';
import { Github, Linkedin, Instagram } from 'lucide-react';
import { socialLinks } from '../../data/socialLinks';

// lucide-react ships the old bird glyph under "twitter" and a generic
// close/cross under "x" — neither is the X logo, so it's inlined here.
const XLogo = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  x: XLogo
};

const SocialLinks = ({ className = '', linkClassName = '', iconSize = 18 }) => (
  <div className={className}>
    {socialLinks.map((link) => {
      const Icon = iconMap[link.icon];
      return (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
          aria-label={link.label}
        >
          <Icon size={iconSize} strokeWidth={1.75} />
        </a>
      );
    })}
  </div>
);

export default SocialLinks;
