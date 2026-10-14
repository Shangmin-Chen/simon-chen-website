const SQUARE_TOLERANCE = 0.08;

/** Classify an image's natural dimensions without guessing while it is unloaded. */
export function mediaOrientation(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return 'unknown';
  const ratio = width / height;
  if (Math.abs(ratio - 1) <= SQUARE_TOLERANCE) return 'square';
  return ratio > 1 ? 'landscape' : 'portrait';
}

/** Fit an image inside an available slot while preserving its source ratio. */
export function containMediaSize(sourceWidth, sourceHeight, availableWidth, availableHeight) {
  if (![sourceWidth, sourceHeight, availableWidth, availableHeight].every(Number.isFinite)
    || sourceWidth <= 0 || sourceHeight <= 0 || availableWidth <= 0 || availableHeight <= 0) return null;
  const scale = Math.min(1, availableWidth / sourceWidth, availableHeight / sourceHeight);
  if (!Number.isFinite(scale) || scale <= 0) return null;
  return { width: sourceWidth * scale, height: sourceHeight * scale };
}

/** A cached orientation belongs only to the photo source that produced it. */
export function orientationForSource(state, source) {
  if (!source || state?.source !== source) return 'unknown';
  return ['portrait', 'landscape', 'square'].includes(state.orientation) ? state.orientation : 'unknown';
}
