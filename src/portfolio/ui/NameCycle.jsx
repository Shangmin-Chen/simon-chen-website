import { useEffect, useState } from 'react';
import { advanceNameCycle, initialNameCycleState, nameGraphemes } from '../domain/name-cycle';

export default function NameCycle({ entries, staticEntry = entries[0], accessibleName = 'Simon Chen', motion, active = true }) {
  const [cycle, setCycle] = useState(() => initialNameCycleState(entries));
  const animated = motion && active && entries.length > 1;

  useEffect(() => {
    if (!animated) return undefined;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setCycle(current => advanceNameCycle(current, entries));
    }, 85);
    return () => window.clearInterval(timer);
  }, [animated, entries]);

  const entry = animated ? entries[cycle.index] : staticEntry;
  const visibleText = animated
    ? nameGraphemes(entry.text).slice(0, cycle.visible).join('')
    : entry.text;

  return <span className="name-cycle-shell">
    <span className="name-cycle" aria-hidden="true" data-animated={animated}>
      <span className="name-cycle-sizer">{entries.map(variant => <span key={`${variant.lang}-${variant.text}`} lang={variant.lang}>{variant.text}</span>)}</span>
      <span className="name-cycle-visual" lang={entry.lang}>{visibleText}</span>
    </span>
    <span className="sr-only">{accessibleName}</span>
  </span>;
}
