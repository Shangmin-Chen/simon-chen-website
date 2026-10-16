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

export const sectionSelectorStageHeight = 110;
export const sectionSelectorOptionHeight = 50;

export function signedCircularOffset(index, phase, count = sections.length) {
  const itemCount = Number.isFinite(count) ? Math.floor(count) : 0;
  if (itemCount <= 0 || !Number.isFinite(index) || !Number.isFinite(phase)) return 0;
  const half = itemCount / 2;
  return ((index - phase + half) % itemCount + itemCount) % itemCount - half;
}

export function sectionSelectorPositions(width, phase, count = sections.length) {
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0;
  const itemCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (!itemCount) return [];

  const radius = itemCount / 2;
  const itemWidth = Math.min(82, safeWidth / (itemCount + 0.32));
  const outerScale = 1 + 0.06 * Math.max(0, 1 - (itemCount - 1) / 2 / radius);
  const step = itemCount > 1 ? (safeWidth - itemWidth * outerScale) / (itemCount - 1) : 0;
  const edgeOffset = (itemCount - 1) / 2;
  const outerY = 4;
  const arcDepth = 38;

  return Array.from({ length: itemCount }, (_, index) => {
    const offset = signedCircularOffset(index, phase, itemCount);
    const distance = Math.abs(offset);
    const proximity = Math.max(0, 1 - distance / radius);
    const seamProgress = Math.max(0, Math.min(1, distance - edgeOffset));
    const seamT = seamProgress / (radius - edgeOffset || 1);
    const seamEase = seamT * seamT * (3 - 2 * seamT);
    const arcProgress = edgeOffset ? Math.min(distance, edgeOffset) / edgeOffset : 0;
    return {
      offset,
      left: safeWidth / 2 + offset * step - itemWidth / 2,
      width: itemWidth,
      arcY: outerY + arcDepth * Math.sqrt(1 - arcProgress ** 2),
      lift: -4 * proximity,
      scale: 1 + 0.06 * proximity,
      opacity: 1 - seamEase,
      front: Math.max(0, 1 - distance),
      depth: Math.round((radius - distance) * 100),
    };
  });
}
