import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { adjacentFileId, filesFor, sequenceFor } from '../domain/reader';
import Whoami from './sections/Whoami';
import Projects from './sections/Projects';
import Pictures from './sections/Pictures';
import Hobbies from './sections/Hobbies';
import Contact from './sections/Contact';
import CardDeck from './CardDeck';
import InspectPanel from './InspectPanel';

const ContentPanel = forwardRef(function ContentPanel({ member, services, albumId, motion, sceneKey, onReturnToCharacters, onGalleryHome }, forwardedRef) {
  const section = member.section;
  const contentRef = useRef(null);
  const textSceneRef = useRef(null);
  const contactRef = useRef(null);
  const picturesRef = useRef(null);
  const [selections, setSelections] = useState({});
  const selectedId = selections[section] ?? '';
  const isContact = section === 'contact';
  const isPictures = section === 'pictures';
  const handleKeyDown = event => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || event.keyCode === 229
      || event.altKey || event.ctrlKey || event.metaKey
      || event.target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return;
    if (isPictures && albumId) { event.preventDefault(); onGalleryHome(); }
    else { event.preventDefault(); onReturnToCharacters?.(); }
  };

  const sectionName = `${section[0].toUpperCase()}${section.slice(1)}`;

  useImperativeHandle(forwardedRef, () => ({
    focusContent() {
      const activeRef = isContact ? contactRef : isPictures ? picturesRef : textSceneRef;
      if (activeRef.current?.focusContent?.()) return true;
      const root = contentRef.current;
      if (!root?.isConnected || root.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
      root.focus({ preventScroll: true });
      return document.activeElement === root;
    },
  }), [isContact, isPictures]);

  return <section ref={contentRef} id="main-content" tabIndex={-1} className="readme" data-view={isContact ? 'contact' : isPictures ? 'gallery' : 'index'} aria-label={`${sectionName} content`} onKeyDown={handleKeyDown}>
    {!isContact && !isPictures && <TextScene
      ref={textSceneRef}
      key={section}
      member={member}
      services={services}
      selectedId={selectedId}
      onSelect={id => setSelections(current => ({ ...current, [section]: id }))}
      onReturnToCharacters={onReturnToCharacters}
      motion={motion}
    />}

    <div className="contact-scene" hidden={!isContact}>
      <Contact ref={contactRef} sendMessage={services.sendMessage} active={isContact} motion={motion} sceneKey={sceneKey} onReturnToCharacters={onReturnToCharacters} />
    </div>

    <div className="pictures-slot" hidden={!isPictures}>
      <Pictures ref={picturesRef} resource={services.gallery} active={isPictures} albumId={albumId} motion={motion} onReturnToCharacters={onReturnToCharacters} />
    </div>
  </section>;
});

export default ContentPanel;

const TextScene = forwardRef(function TextScene({ member, services, selectedId, onSelect, onReturnToCharacters, motion }, forwardedRef) {
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
  const focusHeadingOnEntryRef = useRef(true);
  const key = `${section}:${selectedId}`;

  useImperativeHandle(forwardedRef, () => ({
    focusContent() {
      if (isInspecting) {
        if (!heading.current?.isConnected || heading.current.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
        heading.current.focus({ preventScroll: true });
        return document.activeElement === heading.current;
      }
      return Boolean(deckRef.current?.focusContent?.());
    },
  }), [isInspecting]);

  useEffect(() => () => {
    cancelAnimationFrame(entryFocusFrame.current);
    cancelAnimationFrame(openerFocusFrame.current);
  }, []);

  const openInspector = id => {
    onSelect(id);
    setInspectionId(id);
    focusHeadingOnEntryRef.current = true;
    focusKeyRef.current = '';
    if (body.current) body.current.scrollTop = 0;
  };
  const closeInspector = () => {
    setInspectionId('');
    const origin = document.activeElement;
    cancelAnimationFrame(openerFocusFrame.current);
    openerFocusFrame.current = requestAnimationFrame(() => {
      if (document.activeElement === origin || document.activeElement === document.body) deckRef.current?.focusSelected();
    });
  };
  const moveEntry = direction => {
    const nextId = adjacentFileId(sequence, selectedId, direction);
    if (!nextId) return;
    const nextIndex = sequence.findIndex(entry => entry.id === nextId);
    focusHeadingOnEntryRef.current = nextIndex === 0 || nextIndex === sequence.length - 1;
    onSelect(nextId);
    setInspectionId(nextId);
  };

  useEffect(() => {
    if (!isInspecting) { focusKeyRef.current = ''; focusHeadingOnEntryRef.current = true; return undefined; }
    if (key === focusKeyRef.current) return undefined;
    focusKeyRef.current = key;
    if (body.current) body.current.scrollTop = 0;
    const expectedKey = key;
    cancelAnimationFrame(entryFocusFrame.current);
    entryFocusFrame.current = requestAnimationFrame(() => {
      if (focusKeyRef.current !== expectedKey) return;
      if (focusHeadingOnEntryRef.current) heading.current?.focus();
      focusHeadingOnEntryRef.current = false;
    });
    return () => cancelAnimationFrame(entryFocusFrame.current);
  }, [isInspecting, key]);

  const handleKeyDown = event => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || event.keyCode === 229
      || event.altKey || event.ctrlKey || event.metaKey
      || event.target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return;
    if (isInspecting) { event.preventDefault(); closeInspector(); }
  };

  const title = currentEntry?.title ?? currentEntry?.label ?? '';
  const crumbs = `${section}/${currentEntry?.label ?? ''}`;

  return <div className="text-scene" onKeyDown={handleKeyDown}>
    <div className="home-index" inert={isInspecting} aria-hidden={isInspecting}>
      {section === 'whoami' && <div className="about-copy"><p>I build software and chase side quests.</p><p className="terminal-note">NYC / SF · Boston University</p></div>}
      <CardDeck
        ref={deckRef}
        items={files}
        selectedId={selectedId}
        onReturnToCharacters={onReturnToCharacters}
        motion={motion && !isInspecting}
        onSelect={onSelect}
        onActivate={openInspector}
        label={member.name === 'David' ? 'Whoami' : section[0].toUpperCase() + section.slice(1)}
      />
    </div>
    <InspectPanel
      open={isInspecting}
      title={title}
      breadcrumb={crumbs}
      onClose={closeInspector}
      backLabel={`← ${section}`}
      position={currentIndex + 1}
      total={sequence.length}
      currentLabel={currentEntry?.navigationLabel ?? title}
      onPrevious={() => moveEntry(-1)}
      onNext={() => moveEntry(1)}
      previousDisabled={currentIndex <= 0}
      nextDisabled={currentIndex < 0 || currentIndex >= sequence.length - 1}
      previousLabel={currentIndex > 0 ? `Previous: ${sequence[currentIndex - 1].navigationLabel}` : 'Previous item'}
      nextLabel={currentIndex >= 0 && currentIndex < sequence.length - 1 ? `Next: ${sequence[currentIndex + 1].navigationLabel}` : 'Next item'}
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
});
