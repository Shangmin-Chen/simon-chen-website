import { socialLinks } from '../../data/socialLinks';

export default function SocialLinks({ className = '' }) {
  return <nav className={className} aria-label="Social profiles">
    {socialLinks.map(link => <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>)}
  </nav>;
}
