import { glitchPlan } from '../domain/glitch';

const rows = 12;

export default function SignalBands({ seed, tick, children, className = '' }) {
  const plan = glitchPlan(seed, tick, { width: 48, height: rows, burst: true });
  if (!plan.active) return null;

  return <span className={`signal-bands ${className}`} aria-hidden="true">
    {plan.bands.map((band, index) => <span
      className="signal-bands__slice"
      data-signal={band.interference.signal}
      key={`${band.y}-${band.dx}-${index}`}
      style={{
        '--signal-top': `${(band.y / rows) * 100}%`,
        '--signal-bottom': `${100 - ((band.y + band.height) / rows) * 100}%`,
        '--signal-offset': `${band.dx * 2}px`,
      }}
    >{children}</span>)}
  </span>;
}
