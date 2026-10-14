import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { adjacentFileId, filesFor, isReaderOpen, selectionFor, sequenceFor } from '../domain/reader';
import Whoami from './sections/Whoami';
import Projects from './sections/Projects';
import Pictures from './sections/Pictures';
import Hobbies from './sections/Hobbies';
import Contact from './sections/Contact';

const commands = { whoami: 'whoami', projects: 'ls projects/', pictures: 'ls pictures/', hobbies: 'ls hobbies/', contact: 'write contact' };

function commandFor(section, albumId) {
  if (section === 'pictures' && albumId) return `open pictures/${albumId}`;
  return commands[section];
}

export default function ContentPanel({ member, services, albumId, onPortfolioHome, onGalleryHome, motion }) {
  const section = member.section;
  const [selections, setSelections] = useState({});
  const selectedId = selections[section] ?? '';
  const files = useMemo(() => filesFor(section), [section]);
  const sequence = useMemo(() => sequenceFor(section), [section]);
  const focused = isReaderOpen(section, selectedId, albumId);
  const openerId = useRef({});
  const heading = useRef(null);
  const viewport = useRef(null);
  const lastFocusKey = useRef('');
  const latestSection = useRef(section);
  const focusFrame = useRef(0);

  useLayoutEffect(() => { latestSection.current = section; }, [section]);
  useEffect(() => () => cancelAnimationFrame(focusFrame.current), []);

  const selectFile = (id, trigger) => {
    if (trigger) openerId.current[section] = id;
    setSelections(current => ({ ...current, [section]: selectionFor(section, id) }));
  };
  const setSelection = id => setSelections(current => ({ ...current, [section]: id }));
  const closeReader = () => {
    setSelection('');
    const sectionKey = section;
    const fileId = openerId.current[sectionKey];
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      if (latestSection.current !== sectionKey) return;
      const item = [...(viewport.current?.querySelectorAll('.reader-section:not([hidden]) .file-index-item[data-file-id]') ?? [])]
        .find(candidate => candidate.dataset.fileId === fileId);
      if (item?.isConnected) item.focus();
    });
  };
  const currentIndex = sequence.findIndex(entry => entry.id === selectedId);
  const currentEntry = sequence[currentIndex];
  const moveEntry = direction => {
    setSelection(adjacentFileId(sequence, selectedId, direction));
  };

  const focusKey = `${section}:${selectedId}:${albumId ?? ''}`;
  useLayoutEffect(() => {
    if (focused && viewport.current) viewport.current.scrollTop = 0;
  }, [focused, focusKey]);
  useEffect(() => {
    if (!focused) { lastFocusKey.current = ''; return undefined; }
    if (focusKey === lastFocusKey.current) return undefined;
    lastFocusKey.current = focusKey;
    const frame = requestAnimationFrame(() => {
      if (document.activeElement?.closest('.contact-field')) return;
      heading.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [focused, focusKey]);

  const entryLabel = currentEntry?.label ?? (section === 'contact' ? 'contact/' : '');
  const contact = section === 'contact';
  const routedAlbum = section === 'pictures' && Boolean(albumId);

  const handleKeyDown = event => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey
      || event.target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return;
    if (contact) { event.preventDefault(); onPortfolioHome(); }
    else if (routedAlbum) { event.preventDefault(); onGalleryHome(); }
    else if (focused) { event.preventDefault(); closeReader(); }
  };

  return <section className={`readme${focused ? ' focused-reader' : ''}`} aria-label="Simon Chen portfolio files" onKeyDown={handleKeyDown}>
    <div className="reader-topline">
      <div className="buffer-head"><span>~/{section}{albumId ? `/${albumId}` : ''}</span></div>
      {focused && !routedAlbum && <nav className="reader-actions" aria-label="Reader navigation">
        <button type="button" onClick={contact ? onPortfolioHome : closeReader}>{contact ? '← portfolio home' : '← all files'}</button>
        {!contact && <span>{currentIndex + 1} / {sequence.length}</span>}
        {!contact && <>
          <button type="button" onClick={() => moveEntry(-1)} disabled={currentIndex <= 0} aria-label="Previous file or entry">← Prev</button>
          <button type="button" onClick={() => moveEntry(1)} disabled={currentIndex >= sequence.length - 1} aria-label="Next file or entry">Next →</button>
        </>}
      </nav>}
    </div>
    <h1 className="owner-name">Simon Chen</h1>
    <div className="section-command"><b aria-hidden="true">└─$</b> {commandFor(section, albumId)}</div>
    {focused && !routedAlbum && <h2 className="reader-focus-heading" ref={heading} tabIndex={-1}>{entryLabel}</h2>}

    <div className={`reader-viewport${focused ? ' is-focused' : ' is-index'}`} ref={viewport}
      role={focused ? 'region' : undefined} tabIndex={focused ? 0 : undefined}
      aria-label={focused ? `${entryLabel} reader` : undefined}>
      <div className="reader-section" hidden={section !== 'whoami'}>
        {focused ? <Whoami resource={services.github} active={section === 'whoami' && selectedId === 'github-activity'} fileId={selectedId} /> : <>
          <div className="about-copy"><p>I build software and chase side quests.</p><p className="terminal-note">NYC / SF · Boston University</p></div>
          <FileIndex files={files} onSelect={selectFile} />
        </>}
      </div>
      <div className="reader-section" hidden={section !== 'projects'}>
        {focused ? <Projects fileId={selectedId} /> : <FileIndex files={files} onSelect={selectFile} />}
      </div>
      <div className="reader-section" hidden={section !== 'pictures'}>
        <Pictures resource={services.gallery} active={section === 'pictures'} albumId={albumId} motion={motion} />
      </div>
      <div className="reader-section" hidden={section !== 'hobbies'}>
        {focused ? <Hobbies resource={services.goodreads} active={selectedId === 'reading'} fileId={selectedId} /> : <FileIndex files={files} onSelect={selectFile} />}
      </div>
      <div className="reader-section" hidden={section !== 'contact'}>
        <Contact sendMessage={services.sendMessage} />
      </div>
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
