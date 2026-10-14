import { useEffect, useRef, useState } from 'react';
import glyph from '../assets/intro.json';
import { introFrame } from '../domain/portrait';

export default function Intro({ motion, onFinish }) {
  const buttonRef = useRef(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    buttonRef.current.focus();
    const interval = motion ? window.setInterval(() => setTick(value => value + 1), 70) : null;
    const timeout = window.setTimeout(onFinish, motion ? 2450 : 700);
    return () => { window.clearInterval(interval); window.clearTimeout(timeout); };
  }, [motion, onFinish]);
  const text = motion ? introFrame(glyph, tick) : glyph.join('\n');
  return <div className="intro" role="dialog" aria-modal="true" aria-label="Simon Chen intro" onKeyDown={event => {
    if (event.key === 'Escape') onFinish();
    if (event.key === 'Tab') { event.preventDefault(); buttonRef.current.focus(); }
  }}>
    <div className="intro-emblem" aria-hidden="true">
      <pre className="intro-mark">{text}</pre>
      <pre className="intro-mark intro-ghost">{text}</pre>
      <pre className="intro-mark intro-ghost intro-pink">{text}</pre>
    </div>
    <div className="intro-title">SIMON CHEN</div>
    <div className="intro-code">SIGNAL FOUND.</div>
    <button type="button" ref={buttonRef} onClick={onFinish}>Enter →</button>
  </div>;
}
