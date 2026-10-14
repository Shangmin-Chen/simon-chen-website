import { useEffect, useMemo, useRef, useState } from 'react';
import { adjacentFileId, filesFor, selectionFor, sequenceFor } from '../domain/reader';
import Whoami from './sections/Whoami';
import Projects from './sections/Projects';
import Pictures from './sections/Pictures';
import Hobbies from './sections/Hobbies';
import Contact from './sections/Contact';
import ReaderFrame from './reader/ReaderFrame';

const commands = { whoami: 'whoami', projects: 'ls projects/', pictures: 'ls pictures/', hobbies: 'ls hobbies/', contact: 'write contact' };

function commandFor(section, albumId) {
  if (section === 'pictures' && albumId) return `open pictures/${albumId}`;
  return commands[section];
}

function titleFor(section, entry) {
  if (section === 'contact') return 'contact/';
  return entry?.label ?? '';
}

export default function ContentPanel({ member, services, albumId, onPortfolioHome, onGalleryHome, motion }) {
  const section = member.section;
  const [selections, setSelections] = useState({});
  const selectedId = selections[section] ?? '';
  const files = useMemo(() => filesFor(section), [section]);
  const sequence = useMemo(() => sequenceFor(section), [section]);
  const currentIndex = sequence.findIndex(entry => entry.id === selectedId);
  const currentEntry = sequence[currentIndex];
  const isContact = section === 'contact';
  const isAlbum = section === 'pictures' && Boolean(albumId);
  const isTextReader = isContact || (section !== 'pictures' && Boolean(selectedId));
  const isReader = isTextReader || isAlbum;
  const openerId = useRef({});
  const heading = useRef(null);
  const body = useRef(null);
  const contactHeading = useRef(null);
  const contactBody = useRef(null);
  const latestSection = useRef(section);
  const entryFocusFrame = useRef(0);
  const openerFocusFrame = useRef(0);
  const focusKeyRef = useRef('');
  const key = `${section}:${selectedId}:${albumId ?? ''}`;

  useEffect(() => { latestSection.current = section; }, [section]);
  useEffect(() => () => {
    cancelAnimationFrame(entryFocusFrame.current);
    cancelAnimationFrame(openerFocusFrame.current);
  }, []);

  const selectFile = (id, trigger) => {
    if (trigger) openerId.current[section] = id;
    setSelections(current => ({ ...current, [section]: selectionFor(section, id) }));
  };
  const closeReader = () => {
    const sectionKey = section;
    const fileId = openerId.current[sectionKey];
    setSelections(current => ({ ...current, [sectionKey]: '' }));
    cancelAnimationFrame(openerFocusFrame.current);
    openerFocusFrame.current = requestAnimationFrame(() => {
      if (latestSection.current !== sectionKey) return;
      const item = [...(document.querySelectorAll('.readme[data-view="index"] .file-index-item[data-file-id]'))]
        .find(candidate => candidate.dataset.fileId === fileId && candidate.getClientRects().length);
      if (item?.isConnected) item.focus();
    });
  };
  const moveEntry = direction => setSelections(current => ({
    ...current,
    [section]: adjacentFileId(sequence, selectedId, direction),
  }));

  useEffect(() => {
    if (!isTextReader) { focusKeyRef.current = ''; return undefined; }
    if (key === focusKeyRef.current) return undefined;
    focusKeyRef.current = key;
    const activeBody = isContact ? contactBody.current : body.current;
    if (activeBody) activeBody.scrollTop = 0;
    const expectedSection = section;
    const expectedKey = key;
    cancelAnimationFrame(entryFocusFrame.current);
    entryFocusFrame.current = requestAnimationFrame(() => {
      if (latestSection.current !== expectedSection || focusKeyRef.current !== expectedKey) return;
      if (document.activeElement?.closest('.contact-field')) return;
      (isContact ? contactHeading.current : heading.current)?.focus();
    });
    return () => cancelAnimationFrame(entryFocusFrame.current);
  }, [isContact, isTextReader, key, section]);

  const handleKeyDown = event => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey
      || event.target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return;
    if (isContact) { event.preventDefault(); onPortfolioHome(); }
    else if (isAlbum) { event.preventDefault(); onGalleryHome(); }
    else if (isTextReader) { event.preventDefault(); closeReader(); }
  };

  const entryTitle = titleFor(section, currentEntry);
  const breadcrumbs = `${section}/`;
  const homeIndex = !isContact && section !== 'pictures' && !isTextReader;
  const indexKind = homeIndex ? 'files' : section === 'pictures' && !albumId ? 'gallery' : 'none';

  return <section className="readme" data-view={isReader ? 'reader' : 'index'} data-index-kind={indexKind} aria-label="Simon Chen portfolio files" onKeyDown={handleKeyDown}>
    <h1 className="sr-only">Simon Chen</h1>
    <div className="section-command"><b aria-hidden="true">└─$</b> {commandFor(section, albumId)}</div>
    <div className="home-index" hidden={!homeIndex}>
      <p className="owner-name" aria-hidden="true">Simon Chen</p>
      {section === 'whoami' && <div className="about-copy"><p>I build software and chase side quests.</p><p className="terminal-note">NYC / SF · Boston University</p></div>}
      <FileIndex files={files} onSelect={selectFile} />
    </div>

    <ReaderFrame
      hidden={!isTextReader || isContact}
      title={entryTitle}
      breadcrumb={breadcrumbs}
      backLabel="← all files"
      onBack={closeReader}
      position={currentIndex + 1}
      total={sequence.length}
      onPrevious={() => moveEntry(-1)}
      onNext={() => moveEntry(1)}
      previousDisabled={currentIndex <= 0}
      nextDisabled={currentIndex < 0 || currentIndex >= sequence.length - 1}
      headingRef={heading}
      bodyRef={body}
      mode="text"
      navigationLabel={`${section} entries`}
    >
      <div className="reader-section">
        {section === 'whoami' && <Whoami resource={services.github} active={selectedId === 'github-activity'} fileId={selectedId} />}
        {section === 'projects' && <Projects fileId={selectedId} />}
        {section === 'hobbies' && <Hobbies resource={services.goodreads} active={selectedId === 'reading'} fileId={selectedId} />}
      </div>
    </ReaderFrame>

    <ReaderFrame
      hidden={!isContact}
      title="contact/"
      breadcrumb="contact/"
      backLabel="← portfolio home"
      onBack={onPortfolioHome}
      headingRef={contactHeading}
      bodyRef={contactBody}
      mode="text"
      navigationLabel="Contact reader"
    >
      <Contact sendMessage={services.sendMessage} />
    </ReaderFrame>

    <div className="pictures-slot" hidden={section !== 'pictures'}>
      <Pictures resource={services.gallery} active={section === 'pictures'} albumId={albumId} motion={motion} />
    </div>
  </section>;
}

function FileIndex({ files, onSelect }) {
  return <nav className="file-index" aria-label="Files in this section">
    {files.map((file, index) => <button className="file-index-item" data-file-id={file.id} type="button" key={file.id} onClick={event => onSelect(file.id, event.currentTarget)}>
      <span className="file-index-tree" aria-hidden="true">{index === files.length - 1 ? '└─' : '├─'}</span>
      <span className="file-index-copy"><strong>{file.label}</strong><small>{file.description}</small></span>
      <span className="file-index-open" aria-hidden="true">↗</span>
    </button>)}
  </nav>;
}
