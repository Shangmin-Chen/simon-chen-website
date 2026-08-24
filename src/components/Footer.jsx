import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { scrollToSection } from '../utils/scrollUtils';
import { footerData } from '../data/footerData';
import SocialLinks from './ui/SocialLinks';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToSection(sectionId), 350);
    } else {
      scrollToSection(sectionId);
    }
  };

  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <span className="footer-logo">{footerData.logo}</span>
          <p className="footer-tagline">{footerData.tagline}</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          {footerData.navLinks.map((link) => (
            <a
              key={link.sectionId}
              href={`#${link.sectionId}`}
              className="footer-nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.sectionId);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <SocialLinks className="social-links footer-social" linkClassName="social-link" />
      </div>

      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} {footerData.logo}. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
