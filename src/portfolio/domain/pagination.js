const PAGE_OVERLAP = 32;

export function clampPage(page, count) {
  return Math.min(Math.max(0, page), Math.max(0, count - 1));
}

export function pageStep(viewportHeight, overlap = PAGE_OVERLAP) {
  return Math.max(1, viewportHeight - overlap);
}

export function pageAtOffset(offset, documentHeight, viewportHeight, overlap = PAGE_OVERLAP) {
  const total = pageCount(documentHeight, viewportHeight, overlap);
  const maxOffset = Math.max(0, documentHeight - viewportHeight);
  const safeOffset = Math.min(Math.max(0, offset), maxOffset);
  if (safeOffset >= maxOffset) return total - 1;
  return clampPage(Math.floor(safeOffset / pageStep(viewportHeight, overlap)), total);
}

export function pageCount(documentHeight, viewportHeight, overlap = PAGE_OVERLAP) {
  if (!Number.isFinite(documentHeight) || documentHeight < 0) throw new TypeError('documentHeight must be non-negative');
  if (!Number.isFinite(viewportHeight) || viewportHeight < 0) throw new TypeError('viewportHeight must be non-negative');
  if (!Number.isFinite(overlap) || overlap < 0) throw new TypeError('overlap must be non-negative');
  if (!viewportHeight) return 1;
  return Math.max(1, Math.ceil(Math.max(0, documentHeight - viewportHeight) / pageStep(viewportHeight, overlap)) + 1);
}

export function pageOffset(page, documentHeight, viewportHeight, overlap = PAGE_OVERLAP) {
  if (!viewportHeight) return 0;
  return Math.min(Math.max(0, page) * pageStep(viewportHeight, overlap), Math.max(0, documentHeight - viewportHeight));
}

export function focusOffset(currentOffset, elementTop, elementHeight, viewportHeight, documentHeight) {
  const maxOffset = Math.max(0, documentHeight - viewportHeight);
  if (!viewportHeight || elementHeight >= viewportHeight) return Math.min(Math.max(0, elementTop), maxOffset);
  if (elementTop < currentOffset) return Math.min(Math.max(0, elementTop), maxOffset);
  if (elementTop + elementHeight > currentOffset + viewportHeight) {
    return Math.min(Math.max(0, elementTop + elementHeight - viewportHeight), maxOffset);
  }
  return currentOffset;
}

export function expandedFileOffset(currentOffset, bodyTop, bodyHeight, anchorTop, anchorHeight, viewportHeight, documentHeight) {
  if (bodyHeight <= viewportHeight) {
    return focusOffset(currentOffset, bodyTop, bodyHeight, viewportHeight, documentHeight);
  }
  if (anchorTop !== null && anchorTop !== undefined) {
    return focusOffset(currentOffset, anchorTop, anchorHeight, viewportHeight, documentHeight);
  }
  return focusOffset(currentOffset, bodyTop, viewportHeight, viewportHeight, documentHeight);
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
