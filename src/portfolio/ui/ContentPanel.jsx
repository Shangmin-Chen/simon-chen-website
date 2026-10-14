import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { accumulateWheelDelta, clampPage, expandedFileOffset, focusOffset, pageAtOffset, pageCount, pageOffset } from '../domain/pagination';
import Whoami from './sections/Whoami';
import Projects from './sections/Projects';
import Pictures from './sections/Pictures';
import Hobbies from './sections/Hobbies';
import Contact from './sections/Contact';

const commands = { whoami: 'whoami', projects: 'ls projects/', pictures: 'ls pictures/', hobbies: 'ls hobbies/', contact: 'write contact' };

function isVisibleIn(root, node) {
  return Boolean(node?.isConnected && root?.contains(node) && !node.closest('[hidden]'));
}

export default function ContentPanel({ member, services, albumId }) {
  const section = member.section;
  const key = section === 'pictures' && albumId ? `pictures:${albumId}` : section;
  const [pages, setPages] = useState({});
  const [counts, setCounts] = useState({});
  const [viewHeight, setViewHeight] = useState(0);
  const [documentHeight, setDocumentHeight] = useState(0);
  const [focusedOffset, setFocusedOffset] = useState(null);
  const page = pages[key] ?? 0;
  const count = counts[key] ?? 1;
  const bufferRef = useRef(null);
  const documentRef = useRef(null);
  const gesture = useRef(null);
  const lastWheel = useRef(0);
  const wheelDelta = useRef(0);
  const wheelEventAt = useRef(0);
  const pendingExpansion = useRef(null);
  const layoutRef = useRef(null);
  const latestKey = useRef(key);

  useLayoutEffect(() => {
    latestKey.current = key;
    if (pendingExpansion.current?.key !== key) pendingExpansion.current = null;
    layoutRef.current = { page, count, key, focusedOffset, documentHeight, viewHeight };
  }, [page, count, key, focusedOffset, documentHeight, viewHeight]);

  const setPage = useCallback((pageKey, next) => {
    setFocusedOffset(null);
    pendingExpansion.current = null;
    wheelDelta.current = 0;
    setPages(current => {
      const value = typeof next === 'function' ? next(current[pageKey] ?? 0) : next;
      return { ...current, [pageKey]: clampPage(value, counts[pageKey] ?? 1) };
    });
  }, [counts]);
  const updatePageCount = useCallback((pageKey, nextCount) => {
    const safeCount = Math.max(1, nextCount);
    setCounts(current => current[pageKey] === safeCount ? current : { ...current, [pageKey]: safeCount });
    setPages(current => {
      const currentPage = current[pageKey] ?? 0;
      const safePage = clampPage(currentPage, safeCount);
      return safePage === currentPage ? current : { ...current, [pageKey]: safePage };
    });
  }, []);
  const move = useCallback(delta => setPage(key, current => current + delta), [key, setPage]);
  const currentOffset = () => Math.min(
    focusedOffset?.key === key && focusedOffset.page === page ? focusedOffset.offset : pageOffset(page, documentHeight, viewHeight),
    Math.max(0, documentHeight - viewHeight),
  );

  const revealAtOffset = useCallback((offset, fullHeight, height) => {
    const safeOffset = Math.min(Math.max(0, offset), Math.max(0, fullHeight - height));
    const totalPages = pageCount(fullHeight, height);
    const targetPage = clampPage(pageAtOffset(safeOffset, fullHeight, height), totalPages);
    setPages(current => current[key] === targetPage ? current : { ...current, [key]: targetPage });
    setFocusedOffset(current => current?.key === key && current.page === targetPage && Math.abs(current.offset - safeOffset) < 1
      ? current
      : { key, page: targetPage, offset: safeOffset });
  }, [key]);

  const alignExpandedBody = useCallback((details, height, fullHeight) => {
    const contentDocument = documentRef.current;
    const body = details?.querySelector('.file-body');
    if (!contentDocument || !body || !details.open || !height) return;
    const live = layoutRef.current;
    const current = Math.min(live.focusedOffset?.key === key && live.focusedOffset.page === live.page
      ? live.focusedOffset.offset
      : pageOffset(live.page, fullHeight, height), Math.max(0, fullHeight - height));
    const bodyTop = body.getBoundingClientRect().top - contentDocument.getBoundingClientRect().top;
    const bodyHeight = body.getBoundingClientRect().height;
    const anchor = body.querySelector('[data-page-anchor]');
    const anchorTop = anchor ? anchor.getBoundingClientRect().top - contentDocument.getBoundingClientRect().top : null;
    const target = expandedFileOffset(current, bodyTop, bodyHeight, anchorTop, anchor?.getBoundingClientRect().height ?? 0, height, fullHeight);
    if (Math.abs(target - current) >= 1) revealAtOffset(target, fullHeight, height);
  }, [key, revealAtOffset]);

  useLayoutEffect(() => {
    const viewport = bufferRef.current;
    const contentDocument = documentRef.current;
    if (!viewport || !contentDocument) return undefined;
    const observedKey = key;
    let active = true;
    const measure = () => {
      if (!active || latestKey.current !== observedKey) return;
      const height = viewport.getBoundingClientRect().height;
      const fullHeight = contentDocument.getBoundingClientRect().height;
      setViewHeight(current => current === height ? current : height);
      setDocumentHeight(current => current === fullHeight ? current : fullHeight);
      updatePageCount(observedKey, pageCount(fullHeight, height));
      const pending = pendingExpansion.current;
      if (pending?.key === observedKey && pending.details.open && isVisibleIn(contentDocument, pending.details)) {
        alignExpandedBody(pending.details, height, fullHeight);
      }
      const focused = document.activeElement;
      const contactField = focused?.closest('.contact-field');
      if (contactField && isVisibleIn(contentDocument, focused) && viewport.contains(focused)) {
        const target = contactField;
        const live = layoutRef.current;
        const visibleOffset = live.focusedOffset?.key === observedKey && live.focusedOffset.page === live.page
          ? live.focusedOffset.offset
          : pageOffset(live.page, fullHeight, height);
        const documentRect = contentDocument.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const targetOffset = focusOffset(visibleOffset, targetRect.top - documentRect.top, targetRect.height, height, fullHeight);
        if (Math.abs(targetOffset - visibleOffset) >= 1) revealAtOffset(targetOffset, fullHeight, height);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(contentDocument);
    return () => { active = false; observer.disconnect(); };
  }, [key, updatePageCount, alignExpandedBody, revealAtOffset]);

  useEffect(() => {
    const element = bufferRef.current;
    const onWheel = event => {
      if (event.ctrlKey || event.target.closest('input,textarea,select,[contenteditable="true"]') || !event.deltaY) return;
      event.preventDefault();
      const now = performance.now();
      if (now - wheelEventAt.current > 180) wheelDelta.current = 0;
      wheelEventAt.current = now;
      const accumulated = accumulateWheelDelta(wheelDelta.current, event.deltaY);
      wheelDelta.current = accumulated.total;
      if (!accumulated.ready || now - lastWheel.current < 220) return;
      lastWheel.current = now;
      wheelDelta.current = 0;
      move(accumulated.direction);
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [move]);

  const revealFocused = event => {
    const target = event.target;
    const eventKey = key;
    requestAnimationFrame(() => {
      const viewport = bufferRef.current;
      const contentDocument = documentRef.current;
      if (latestKey.current !== eventKey || !viewport || !contentDocument || document.activeElement !== target || !isVisibleIn(contentDocument, target)) return;
      viewport.scrollTop = 0;
      const height = viewport.getBoundingClientRect().height;
      if (!height) return;
      const focusTarget = target.closest('.contact-field') ?? target;
      const targetRect = focusTarget.getBoundingClientRect();
      const documentRect = contentDocument.getBoundingClientRect();
      const visibleOffset = focusedOffset?.key === key && focusedOffset.page === page ? focusedOffset.offset : pageOffset(page, documentHeight, height);
      const absoluteTop = targetRect.top - documentRect.top;
      const fullHeight = contentDocument.getBoundingClientRect().height;
      const targetOffset = focusOffset(visibleOffset, absoluteTop, targetRect.height, height, fullHeight);
      if (targetOffset !== visibleOffset) revealAtOffset(targetOffset, fullHeight, height);
    });
  };
  const revealExpandedFile = event => {
    const details = event.target.closest('summary')?.parentElement;
    if (details?.tagName !== 'DETAILS') return;
    const eventKey = key;
    requestAnimationFrame(() => {
      const viewport = bufferRef.current;
      const contentDocument = documentRef.current;
      if (!details.open) {
        if (pendingExpansion.current?.details === details && pendingExpansion.current.key === eventKey) pendingExpansion.current = null;
        return;
      }
      if (latestKey.current !== eventKey || !viewport || !contentDocument || !isVisibleIn(contentDocument, details)) return;
      pendingExpansion.current = { key: eventKey, details };
      viewport.scrollTop = 0;
      alignExpandedBody(details, viewport.getBoundingClientRect().height, contentDocument.getBoundingClientRect().height);
    });
  };

  return <section className="readme" aria-label="Simon Chen portfolio files">
    <div className="buffer-head"><span>~/{section}{albumId ? `/${albumId}` : ''}</span></div>
    <h1 className="owner-name">Simon Chen</h1>
    <div className="section-command"><b aria-hidden="true">└─$</b> {commands[section]}</div>
    <div className="content-buffer" ref={bufferRef} role="region" aria-label={`${section} content`} tabIndex={0}
        onFocusCapture={revealFocused}
        onClickCapture={revealExpandedFile}
        onKeyDown={event => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
          if (event.key === 'PageDown' || event.key === 'PageUp') { event.preventDefault(); move(event.key === 'PageDown' ? 1 : -1); }
        }}
        onPointerDown={event => {
          if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
          gesture.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
        }}
        onPointerUp={event => {
          const start = gesture.current; gesture.current = null;
          if (!start || start.id !== event.pointerId) return;
          const dx = event.clientX - start.x; const dy = event.clientY - start.y;
          if (Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx)) move(dy < 0 ? 1 : -1);
        }}
        onPointerCancel={() => { gesture.current = null; }}>
        <div className="content-document" ref={documentRef} style={{ transform: `translateY(-${Math.min(currentOffset(), Math.max(0, documentHeight - viewHeight))}px)` }}>
          <section hidden={section !== 'whoami'} aria-label="whoami"><Whoami resource={services.github} active={section === 'whoami'} /></section>
          <section hidden={section !== 'projects'} aria-label="Projects"><Projects /></section>
          <section hidden={section !== 'pictures'} aria-label="Pictures"><Pictures resource={services.gallery} active={section === 'pictures'} albumId={albumId} /></section>
          <section hidden={section !== 'hobbies'} aria-label="Hobbies"><Hobbies resource={services.goodreads} active={section === 'hobbies'} /></section>
          <section hidden={section !== 'contact'} aria-label="Contact"><Contact sendMessage={services.sendMessage} /></section>
        </div>
    </div>
    <nav className="content-pager" aria-label={`${section} pages`}>
      <button type="button" onClick={() => move(-1)} disabled={page <= 0}>← Previous</button>
      <span aria-live="polite">Page {Math.min(page + 1, count)} of {count}</span>
      <button type="button" onClick={() => move(1)} disabled={page >= count - 1 && currentOffset() >= Math.max(0, documentHeight - viewHeight)}>Next →</button>
    </nav>
  </section>;
}
