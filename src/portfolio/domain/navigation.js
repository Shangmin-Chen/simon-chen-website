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

export function wheelMode(viewportWidth, viewportHeight) {
  const width = Number.isFinite(viewportWidth) ? Math.max(0, viewportWidth) : 0;
  const height = Number.isFinite(viewportHeight) ? Math.max(0, viewportHeight) : 0;
  const short = height <= 560 || (width <= 850 && height <= 700);
  return {
    compact: width <= 650 || short,
    medium: width > 480 && width <= 650 && height > 700,
    short,
    wideShort: width > 650 && short,
  };
}

export function wheelSize(compact, short = false, medium = false, wideShort = false) {
  const dimension = compact ? (wideShort ? 120 : short ? 112 : medium ? 156 : 128) : (short ? 188 : 220);
  return { width: dimension, height: dimension };
}

export function wheelPosition(offset, width, compact, short = false, medium = false, wideShort = false) {
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0;
  const radius = compact ? Math.min(34, safeWidth * 0.25) : Math.min(72, safeWidth * 0.33);
  const { height } = wheelSize(compact, short, medium, wideShort);
  const buttonHalfHeight = compact ? 20 : 25;
  const angle = offset * 72 * Math.PI / 180;
  return {
    x: compact ? 0 : Math.sin(angle) * radius,
    y: compact ? height / 2 - buttonHalfHeight : height / 2 - Math.cos(angle) * radius - buttonHalfHeight,
    scale: offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.96 : 0.94,
    hidden: compact && offset !== 0,
  };
}

export function wheelRail(compact, short = false) {
  const columns = 72;
  const rowCount = compact ? (short ? 12 : 14) : (short ? 18 : 20);
  const rows = Array.from({ length: rowCount }, () => Array(columns).fill(' '));
  const radiusX = 29;
  const radiusY = compact ? 5 : 8;
  const centerX = (columns - 1) / 2;
  const centerY = (rowCount - 1) / 2;
  for (let y = 0; y < rowCount; y++) {
    for (let x = 0; x < columns; x++) {
      const dx = (x - centerX) / radiusX;
      const dy = (y - centerY) / radiusY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(distance - 1) < (compact ? 0.15 : 0.13)) {
        rows[y][x] = dx > 0.7 ? '/' : dx < -0.7 ? '\\' : '-';
      }
    }
  }
  return rows.map(row => row.join('')).join('\n');
}
