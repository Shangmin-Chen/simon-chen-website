import { useEffect, useMemo, useRef, useState } from 'react';
import { adjacentFileId, filesFor, sequenceFor } from '../domain/reader';
import Whoami from './sections/Whoami';
import Projects from './sections/Projects';
import Pictures from './sections/Pictures';
import Hobbies from './sections/Hobbies';
import Contact from './sections/Contact';
import CardDeck from './CardDeck';
import InspectPanel from './InspectPanel';

const commands = { whoami: 'whoami', projects: 'ls projects/', pictures: 'ls pictures/', hobbies: 'ls hobbies/', contact: 'open comms' };

function commandFor(section, albumId) {
  if (section === 'pictures' && albumId) return `open pictures/${albumId}`;
  return commands[section];
}

export default function ContentPanel({ member, services, albumId, motion, hubRef, onPortfolioHome, onGalleryHome }) {
  const section = member.section;
  const [selections, setSelections] = useState({});
  const selectedId = selections[section] ?? '';
  const isContact = section === 'contact';
  const isPictures = section === 'pictures';
  const handleKeyDown = event => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey
      || event.target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return;
    if (isContact) { event.preventDefault(); onPortfolioHome(); }
    else if (isPictures && albumId) { event.preventDefault(); onGalleryHome(); }
  };

  return <section className="readme" data-view={isContact ? 'contact' : isPictures ? 'gallery' : 'index'} aria-label="Simon Chen portfolio scene" onKeyDown={handleKeyDown}>
    <h1 className="sr-only">Simon Chen</h1>
    <div className="section-command"><b aria-hidden="true">└─$</b> {commandFor(section, albumId)}</div>

    {!isContact && !isPictures && <TextScene
      key={section}
      member={member}
      services={services}
      selectedId={selectedId}
      onSelect={id => setSelections(current => ({ ...current, [section]: id }))}
      motion={motion}
      hubRef={hubRef}
    />}

    <div className="contact-scene" hidden={!isContact}>
      <Contact sendMessage={services.sendMessage} />
    </div>

    <div className="pictures-slot" hidden={!isPictures}>
      <Pictures resource={services.gallery} active={isPictures} albumId={albumId} motion={motion} hubRef={hubRef} />
    </div>
  </section>;
}

function TextScene({ member, services, selectedId, onSelect, motion, hubRef }) {
  const section = member.section;
  const files = useMemo(() => filesFor(section), [section]);
  const sequence = useMemo(() => sequenceFor(section), [section]);
  const currentIndex = sequence.findIndex(entry => entry.id === selectedId);
  const currentEntry = sequence[currentIndex];
  const [inspectionId, setInspectionId] = useState('');
  const isInspecting = inspectionId === selectedId && Boolean(currentEntry);
  const deckRef = useRef(null);
  const heading = useRef(null);
  const body = useRef(null);
  const entryFocusFrame = useRef(0);
  const openerFocusFrame = useRef(0);
  const focusKeyRef = useRef('');
  const key = `${section}:${selectedId}`;

  useEffect(() => () => {
    cancelAnimationFrame(entryFocusFrame.current);
    cancelAnimationFrame(openerFocusFrame.current);
  }, []);

  const openInspector = id => {
    onSelect(id);
    setInspectionId(id);
    focusKeyRef.current = '';
    if (body.current) body.current.scrollTop = 0;
  };
  const closeInspector = () => {
    setInspectionId('');
    cancelAnimationFrame(openerFocusFrame.current);
    openerFocusFrame.current = requestAnimationFrame(() => deckRef.current?.focusSelected());
  };
  const moveEntry = direction => {
    const nextId = adjacentFileId(sequence, selectedId, direction);
    if (!nextId) return;
    onSelect(nextId);
    setInspectionId(nextId);
  };

  useEffect(() => {
    if (!isInspecting) { focusKeyRef.current = ''; return undefined; }
    if (key === focusKeyRef.current) return undefined;
    focusKeyRef.current = key;
    if (body.current) body.current.scrollTop = 0;
    const expectedKey = key;
    cancelAnimationFrame(entryFocusFrame.current);
    entryFocusFrame.current = requestAnimationFrame(() => {
      if (focusKeyRef.current !== expectedKey) return;
      heading.current?.focus();
    });
    return () => cancelAnimationFrame(entryFocusFrame.current);
  }, [isInspecting, key]);

  const handleKeyDown = event => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey
      || event.target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return;
    if (isInspecting) { event.preventDefault(); closeInspector(); }
  };

  const title = currentEntry?.title ?? currentEntry?.label ?? '';
  const crumbs = `${section}/${currentEntry?.label ?? ''}`;

  return <div className="text-scene" onKeyDown={handleKeyDown}>
    <div className="home-index" inert={isInspecting} aria-hidden={isInspecting}>
      <p className="owner-name" aria-hidden="true">Simon Chen</p>
      {section === 'whoami' && <div className="about-copy"><p>I build software and chase side quests.</p><p className="terminal-note">NYC / SF · Boston University</p></div>}
      <CardDeck
        ref={deckRef}
        items={files}
        selectedId={selectedId}
        motion={motion && !isInspecting}
        onSelect={onSelect}
        onActivate={openInspector}
        label={`${member.name} ${section} cards`}
        hubRef={hubRef}
      />
    </div>
    <InspectPanel
      open={isInspecting}
      title={title}
      breadcrumb={crumbs}
      onClose={closeInspector}
      position={currentIndex + 1}
      total={sequence.length}
      onPrevious={() => moveEntry(-1)}
      onNext={() => moveEntry(1)}
      previousDisabled={currentIndex <= 0}
      nextDisabled={currentIndex < 0 || currentIndex >= sequence.length - 1}
      headingRef={heading}
      bodyRef={body}
      navigationLabel={`${section} cards`}
      motion={motion && isInspecting}
      revealKey={selectedId}
    >
      <div className="reader-section">
        {section === 'whoami' && <Whoami resource={services.github} active={selectedId === 'github-activity' && isInspecting} fileId={selectedId} />}
        {section === 'projects' && <Projects fileId={selectedId} />}
        {section === 'hobbies' && <Hobbies resource={services.goodreads} active={selectedId === 'reading' && isInspecting} fileId={selectedId} />}
      </div>
    </InspectPanel>
  </div>;
}
