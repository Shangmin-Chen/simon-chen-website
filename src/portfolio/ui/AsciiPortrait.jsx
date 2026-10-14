import { useEffect, useMemo, useRef, useState } from 'react';
import { colorRuns, eyeCells, portraitFrame } from '../domain/portrait';

export default function AsciiPortrait({ member, motion }) {
  const portraitRef = useRef(null);
  const burstUntil = useRef(0);
  const [frame, setFrame] = useState({ tick: 0, gaze: { x: 0, y: 0 }, burst: false });
  const masks = useMemo(() => eyeCells(member.portrait), [member]);
  useEffect(() => {
    if (!motion) return;
    let tick = 0;
    let target = { x: 0, y: 0 };
    let gaze = { x: 0, y: 0 };
    const transmissionEnd = performance.now() + 220;
    const move = event => {
      if (event.pointerType === 'touch') return;
      const box = portraitRef.current.getBoundingClientRect();
      target = {
        x: Math.max(-1, Math.min(1, (event.clientX - box.left - box.width / 2) / (window.innerWidth * 0.35))),
        y: Math.max(-1, Math.min(1, (event.clientY - box.top - box.height / 2) / (window.innerHeight * 0.36))),
      };
    };
    const leave = () => { target = { x: 0, y: 0 }; };
    window.addEventListener('pointermove', move);
    document.addEventListener('pointerleave', leave);
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      tick++;
      gaze = { x: gaze.x + (target.x - gaze.x) * 0.18, y: gaze.y + (target.y - gaze.y) * 0.18 };
      setFrame({ tick, gaze, burst: performance.now() < Math.max(transmissionEnd, burstUntil.current) });
    }, 65);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, [motion]);

  const { portrait } = member;
  const grid = portraitFrame(portrait, { ...frame, motion }, masks);
  const palette = [...portrait.palette, '270 48% 7%', portrait.scleraHsl, '292 62% 70%', '279 48% 38%', '157 85% 84%', portrait.skinHsl];
  const colors = Object.fromEntries(palette.map((value, i) => [`--portrait-${i}`, `hsl(${value})`]));
  const label = `[ ${member.name.toUpperCase()} ]`;
  return (
    <>
      <button
        ref={portraitRef}
        type="button"
        className="ascii-portrait"
        style={colors}
        data-character={member.id}
        data-gaze-x={motion ? frame.gaze.x.toFixed(2) : '0'}
        data-gaze-y={motion ? frame.gaze.y.toFixed(2) : '0'}
        aria-label={`${member.name} from Cyberpunk Edgerunners in colored ASCII.${motion && portrait.eyes.length ? ' Eyes follow your cursor.' : ''}${motion ? ' Click to glitch.' : ' Animation off.'}`}
        disabled={!motion}
        onClick={() => { burstUntil.current = performance.now() + 430; }}
      >
        <span className="ascii-portrait-text" aria-hidden="true">
          <span className="portrait-title">{'+--' + label + '-'.repeat(portrait.width - label.length - 2) + '+'}</span>{'\n'}
          {grid.map((row, y) => <span key={y}><span className="portrait-border">|</span>{colorRuns(row).map((run, x) =>
            <span key={x} style={{ color: `var(--portrait-${run.color})` }}>{run.text}</span>
          )}<span className="portrait-border">|</span>{'\n'}</span>)}
          <span className="portrait-border">{'+' + '-'.repeat(portrait.width) + '+'}</span>
        </span>
      </button>
      <div className="portrait-caption">
        <div><strong>{member.name}</strong><span className="character-role"> / {member.role}</span><span className="character-section"> / {member.section}</span></div>
        <button type="button" disabled={!motion} onClick={() => { burstUntil.current = performance.now() + 430; }}>[ glitch ]</button>
      </div>
    </>
  );
}
