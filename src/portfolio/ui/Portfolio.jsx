import { useCallback, useEffect, useRef, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router';
import crew from '../assets/crew.json';
import { sections, sectionFromLocation, wrapIndex } from '../domain/navigation';
import { nameVariants, staticName } from '../../data/nameVariants';
import AsciiPortrait from './AsciiPortrait';
import CharacterSelector from './CharacterSelector';
import ContentPanel from './ContentPanel';
import Intro from './Intro';
import NameCycle from './NameCycle';
import { useMotion } from './useMotion';

const rule = '-'.repeat(160);
const selectorHeadingWords = ['character', ...sections].map(text => ({ lang: 'en', text }));

export default function Portfolio({ services, preferences }) {
  const location = useLocation();
  const navigate = useNavigate();
  const section = sectionFromLocation(location);
  const sectionLabel = `${section[0].toUpperCase()}${section.slice(1)}`;
  const selected = crew.findIndex(member => member.section === section);
  const member = crew[selected];
  const albumId = matchPath('/gallery/:albumId', location.pathname)?.params.albumId;
  const rootRef = useRef(null);
  const selectorRef = useRef(null);
  const previousFocus = useRef(null);
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
  const focusCurrentCharacter = useCallback(() => selectorRef.current?.focusSelected(), []);

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
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
      else selectorRef.current?.focusSelected();
      previousFocus.current = null;
    }
    wasIntroOpen.current = introOpen;
  }, [introOpen]);
  return <div className="portfolio" ref={rootRef} data-motion={motion} data-ambient={ambient} data-intro-open={introOpen}>
    <div className="portfolio-surface" inert={introOpen}>
      <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); rootRef.current.querySelector('#main-content')?.focus(); }}>Skip to main content</a>
      <header className="terminal-header">
        <div className="terminal-brand">
          <span className="terminal-host"><span className="terminal-host-prefix">simon@</span><NameCycle entries={nameVariants} staticEntry={staticName} motion={motion} active={!introOpen} /></span>
          <span className="terminal-name-caption">{'// my name in the languages I speak'}</span>
        </div>
        <button type="button" onClick={() => { previousFocus.current = document.activeElement; setIntroOpen(true); }}>[ replay intro ]</button>
      </header>
      <div className="ascii-rule" aria-hidden="true">{rule}</div>
      <main className="workspace">
        <h1 className="sr-only">Simon Chen</h1>
        <section className="character-profile" aria-label="Edgerunners character navigation">
          <div className="character-art"><AsciiPortrait key={member.id} member={member} motion={motion && !introOpen} /></div>
          <div className="character-navigation"><CharacterSelector
            ref={selectorRef}
            crew={crew}
            selected={selected}
            onSelect={select}
            headingWords={selectorHeadingWords}
            motion={motion}
            active={!introOpen && tabVisible}
          /></div>
        </section>
        <ContentPanel member={member} services={services} albumId={albumId} motion={ambient} sceneKey={location.key} onReturnToCharacters={focusCurrentCharacter} onGalleryHome={() => navigate('/gallery')} />
      </main>
      <div className="ascii-rule" aria-hidden="true">{rule}</div>
      <footer className="terminal-footer"><span>~/simon-chen</span><button type="button" disabled={reduced} aria-pressed={motion} aria-label={reduced ? 'Animation disabled by your reduced motion preference' : 'Toggle animation'} onClick={toggle}>[ motion {motion ? 'on' : 'off'} ]</button></footer>
      <div className="sr-only" aria-live="polite">{sectionLabel} / {member.name} / {member.role}</div>
    </div>
    {introOpen && <Intro motion={motion} onFinish={finishIntro} />}
  </div>;
}
