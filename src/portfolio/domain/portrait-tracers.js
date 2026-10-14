import { portraitEyeCenters } from './portrait.js';

// Convert the 72x33 source grid into viewport points. The title occupies one
// line; the frame adds one character column on the left of each eye.
export function portraitEyePoints(portrait, { textRect, rootRect, charWidth, lineHeight, gazeX = 0 }) {
  if (!portrait.eyes?.length || !textRect || !rootRect || !charWidth || !lineHeight) return [];
  return portraitEyeCenters(portrait, gazeX).map(({ x, y }) => ({
    x: textRect.left - rootRect.left + (x + 1.5) * charWidth,
    y: textRect.top - rootRect.top + (y + 1.5) * lineHeight,
  }));
}

export function tracerSegment(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return {
    left: from.x,
    top: from.y,
    length: Math.hypot(dx, dy),
    angle: Math.atan2(dy, dx),
  };
}
