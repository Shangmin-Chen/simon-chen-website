import { useEffect, useRef, useState } from 'react';
import glyph from '../assets/intro.json';
import { introFrame } from '../domain/portrait';
import { glitchPlan, interferenceBandText } from '../domain/glitch';

const interferenceColors = {
  cyan: 'var(--link-color)',
  pink: 'var(--highlight-color)',
  amber: 'var(--accent-color)',
};

export default function Intro({ motion, onFinish }) {
  const buttonRef = useRef(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    buttonRef.current.focus();
    const interval = motion ? window.setInterval(() => setTick(value => value + 1), 70) : null;
    const timeout = window.setTimeout(onFinish, motion ? 2450 : 700);
    return () => { window.clearInterval(interval); window.clearTimeout(timeout); };
  }, [motion, onFinish]);
  const glitch = motion && tick < 25 ? glitchPlan(0x494e5452, tick, { width: Math.max(...glyph.map(line => line.length)), height: glyph.length, burst: true }) : { active: false, bands: [] };
  const text = introFrame(glyph, tick, motion, glitch);
  return <div className="intro" role="dialog" aria-modal="true" aria-label="Simon Chen intro" onKeyDown={event => {
    if (event.key === 'Escape') onFinish();
    if (event.key === 'Tab') { event.preventDefault(); buttonRef.current.focus(); }
  }}>
    <div className="intro-emblem" aria-hidden="true" data-glitch-active={glitch.active} data-glitch-bands={glitch.bands.length}>
      <pre className="intro-mark">{text}</pre>
      {glitch.bands.map((band, index) => {
        const top = (band.y / glyph.length) * 100;
        const bottom = 100 - ((band.y + band.height) / glyph.length) * 100;
        const style = {
          clipPath: `inset(${top}% 0 ${bottom}% 0)`,
          transform: `translateX(${band.dx}ch)`,
          color: interferenceColors[band.interference.signal],
          opacity: band.interference.mode === 'wash' ? .82 : .62,
        };
        const bandText = introFrame(glyph, band.refreshTick, true, { bands: [] });
        const maskedBandText = interferenceBandText(bandText.split('\n'), band);
        return <pre key={`${band.y}-${index}`} className="intro-mark intro-glitch-band" style={style}>{maskedBandText}</pre>;
      })}
    </div>
    <div className="intro-title">SIMON CHEN</div>
    <div className="intro-code">SIGNAL FOUND.</div>
    <button type="button" ref={buttonRef} onClick={onFinish}>Enter →</button>
  </div>;
}
