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

export const sectionSelectorStageHeight = 90;

export function sectionSelectorPositions(width, selected, count = sections.length) {
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0;
  const itemCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (!itemCount) return [];

  const gap = Math.min(4, safeWidth / Math.max(1, itemCount * 2));
  const selectedIndex = wrapIndex(selected, itemCount);
  const scale = 1.06;
  const itemWidth = Math.max(0, (safeWidth - gap * (itemCount - 1)) / (itemCount + scale - 1));
  const leadingSpace = selectedIndex === 0 ? itemWidth * (scale - 1) / 2 : 0;
  const midpoint = (itemCount - 1) / 2;
  const arcDepth = Math.min(32, Math.max(26, safeWidth * 0.09));

  return Array.from({ length: itemCount }, (_, index) => {
    const distance = midpoint ? (index - midpoint) / midpoint : 0;
    const isSelected = index === selectedIndex;
    return {
      left: leadingSpace + index * (itemWidth + gap),
      width: itemWidth,
      arcY: 8 + distance * distance * arcDepth,
      lift: isSelected ? -5 : 0,
      scale: isSelected ? scale : 1,
      selected: isSelected,
    };
  });
}
