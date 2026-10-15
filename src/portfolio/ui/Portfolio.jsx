import { useCallback, useEffect, useRef, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router';
import crew from '../assets/crew.json';
import { sectionFromLocation, wrapIndex } from '../domain/navigation';
import { nameVariants, staticName } from '../../data/nameVariants';
import AsciiPortrait from './AsciiPortrait';
import CrewWheel from './CrewWheel';
import ContentPanel from './ContentPanel';
import Intro from './Intro';
import NameCycle from './NameCycle';
import { useMotion } from './useMotion';

const rule = '-'.repeat(160);

export default function Portfolio({ services, preferences }) {
  const location = useLocation();
  const navigate = useNavigate();
  const section = sectionFromLocation(location);
  const selected = crew.findIndex(member => member.section === section);
  const member = crew[selected];
  const albumId = matchPath('/gallery/:albumId', location.pathname)?.params.albumId;
  const rootRef = useRef(null);
  const hubRef = useRef(null);
  const previousFocus = useRef(null);
  const focusCrewForSection = useRef('');
  const [crewFocusVersion, setCrewFocusVersion] = useState(0);
  const [introOpen, setIntroOpen] = useState(() => location.pathname === '/' && (!location.hash || location.hash === '#whoami'));
  const [tabVisible, setTabVisible] = useState(() => document.visibilityState !== 'hidden');
  const wasIntroOpen = useRef(introOpen);
  const { motion, reduced, toggle } = useMotion(preferences);
  const ambient = motion && !introOpen && tabVisible;
  const finishIntro = useCallback(() => setIntroOpen(false), []);
  const select = useCallback(index => {
    const next = crew[wrapIndex(index, crew.length)];
    navigate(next.section === 'pictures' ? '/gallery' : `/#${next.section}`);
  }, [navigate]);

  useEffect(() => {
    document.title = section === 'whoami' ? 'Simon Chen' : `${section[0].toUpperCase()}${section.slice(1)} · Simon Chen`;
  }, [section]);
  useEffect(() => {
    const updateVisibility = () => setTabVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);
  useEffect(() => {
    if (wasIntroOpen.current && !introOpen) {
      const target = previousFocus.current?.isConnected ? previousFocus.current : rootRef.current.querySelector('.crew-option[aria-pressed="true"]');
      target?.focus();
      previousFocus.current = null;
    }
    wasIntroOpen.current = introOpen;
  }, [introOpen]);
  useEffect(() => {
    if (focusCrewForSection.current !== section) return;
    focusCrewForSection.current = '';
    rootRef.current?.querySelector('.crew-option[aria-pressed="true"]:not([hidden])')?.focus();
  }, [crewFocusVersion, section]);

  return <div className="portfolio" ref={rootRef} data-motion={motion} data-ambient={ambient} data-intro-open={introOpen} onKeyDown={event => {
    if (introOpen || event.isComposing || event.keyCode === 229 || event.ctrlKey || event.altKey || event.metaKey || event.defaultPrevented || event.target.closest('input,textarea,select,[role="dialog"]')) return;
    if (/^[1-5]$/.test(event.key)) {
      event.preventDefault();
      const nextSection = crew[Number(event.key) - 1].section;
      focusCrewForSection.current = nextSection;
      setCrewFocusVersion(version => version + 1);
      select(Number(event.key) - 1);
    }
  }}>
    <div className="portfolio-surface" inert={introOpen}>
      <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); rootRef.current.querySelector('main').focus(); }}>Skip to main content</a>
      <header className="terminal-header">
        <div className="terminal-brand">
          <span className="terminal-host"><span className="terminal-host-prefix">simon@</span><NameCycle entries={nameVariants} staticEntry={staticName} motion={motion} active={!introOpen} /></span>
          <span className="terminal-name-caption">{'// my name in the languages I speak'}</span>
        </div>
        <button type="button" onClick={() => { previousFocus.current = document.activeElement; setIntroOpen(true); }}>[ replay intro ]</button>
      </header>
      <div className="ascii-rule" aria-hidden="true">{rule}</div>
      <main className="workspace" id="main-content" tabIndex={-1}>
        <section className="character-profile" aria-label="Edgerunners character navigation">
          <div className="character-art"><AsciiPortrait key={member.id} member={member} motion={motion && !introOpen} /></div>
          <div className="character-navigation"><CrewWheel crew={crew} selected={selected} onSelect={select} hubRef={hubRef} hubActive={section !== 'contact'} /></div>
        </section>
        <ContentPanel member={member} services={services} albumId={albumId} motion={ambient} hubRef={hubRef} onPortfolioHome={() => navigate('/#whoami')} onGalleryHome={() => navigate('/gallery')} />
      </main>
      <div className="ascii-rule" aria-hidden="true">{rule}</div>
      <footer className="terminal-footer"><span>~/simon-chen</span><button type="button" disabled={reduced} aria-pressed={motion} aria-label={reduced ? 'Animation disabled by your reduced motion preference' : 'Toggle animation'} onClick={toggle}>[ motion {motion ? 'on' : 'off'} ]</button></footer>
      <div className="sr-only" aria-live="polite">{member.name} / {member.role} / {member.section}</div>
    </div>
    {introOpen && <Intro motion={motion} onFinish={finishIntro} />}
  </div>;
}
