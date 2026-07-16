import React from 'react';
import { Github, Linkedin, Instagram, Twitter } from 'lucide-react';
import { socialLinks } from '../../data/socialLinks';

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  twitter: Twitter
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
