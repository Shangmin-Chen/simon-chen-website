export const sections = ['whoami', 'projects', 'pictures', 'hobbies', 'contact'];

export function wrapIndex(index, length = sections.length) {
  return ((index % length) + length) % length;
}

export function accumulateWheelDelta(accumulated, delta, threshold = 10) {
  if (!Number.isFinite(accumulated) || !Number.isFinite(delta) || !Number.isFinite(threshold) || threshold <= 0) {
    throw new TypeError('wheel deltas and threshold must be finite, with a positive threshold');
  }
  if (!delta) return { total: accumulated, direction: Math.sign(accumulated), ready: Math.abs(accumulated) >= threshold };
  const directionChanged = accumulated && Math.sign(accumulated) !== Math.sign(delta);
  const total = directionChanged ? delta : accumulated + delta;
  return { total, direction: Math.sign(total), ready: Math.abs(total) >= threshold };
}

export function sectionFromLocation({ pathname, hash }) {
  if (pathname === '/gallery' || pathname.startsWith('/gallery/')) return 'pictures';
  const value = hash.replace(/^#/, '');
  if (sections.includes(value)) return value;
  if (value === 'gallery') return 'pictures';
  if (value === 'now') return 'hobbies';
  return 'whoami';
}

export function wheelOffset(index, selected, length = sections.length) {
  const offset = wrapIndex(index - selected, length);
  return offset > length / 2 ? offset - length : offset;
}

function wheelGeometry(compact, short) {
  return compact
    ? { step: 55, radius: short ? 12 : 33, top: short ? 0 : 12, spread: 0.45, railOffset: 51, rows: short ? 10 : 14 }
    : { step: 40, radius: 90, top: 18, spread: 0.38, railOffset: 42, rows: 20 };
}

export function wheelPosition(offset, width, compact, short = false) {
  const geometry = wheelGeometry(compact, short);
  const angle = offset * geometry.step * Math.PI / 180;
  return {
    x: Math.sin(angle) * width * geometry.spread,
    y: geometry.top + Math.cos(angle) * geometry.radius,
    scale: offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.96 : 0.94,
    hidden: compact && Math.abs(offset) > 1,
  };
}

export function wheelRail(compact, short = false) {
  const geometry = wheelGeometry(compact, short);
  const columns = 72;
  const rows = Array.from({ length: geometry.rows }, () => Array(columns).fill(' '));
  const limit = compact ? 55 : 80;
  for (let i = 0; i <= 120; i++) {
    const angle = (-limit + i * limit * 2 / 120) * Math.PI / 180;
    const x = Math.round((0.5 + Math.sin(angle) * geometry.spread) * (columns - 1));
    const y = Math.round((geometry.top + Math.cos(angle) * geometry.radius + geometry.railOffset) / 8);
    if (rows[y]) rows[y][x] = Math.abs(angle) < 0.3 ? '-' : angle < 0 ? '\\' : '/';
  }
  return rows.map(row => row.join('')).join('\n');
}
