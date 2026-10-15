export function cardIndexFor(items, selectedId) {
  if (!items?.length) return -1;
  const selectedIndex = items.findIndex(item => item.id === selectedId);
  return selectedIndex < 0 ? 0 : selectedIndex;
}

export function moveCardIndex(index, offset, length) {
  if (!Number.isInteger(length) || length < 1) return -1;
  if (!Number.isInteger(index) || index < 0) return 0;
  if (!Number.isInteger(offset)) return index;
  return Math.max(0, Math.min(length - 1, index + offset));
}

export function moveInventoryIndex(index, direction, columns, length) {
  const stride = Math.max(1, Math.floor(columns) || 1);
  if (!Number.isInteger(length) || length < 1) return -1;
  const safeIndex = Math.max(0, Math.min(length - 1, Number.isInteger(index) ? index : 0));
  if (stride === 1 && (direction === 'left' || direction === 'right')) {
    return moveCardIndex(safeIndex, direction === 'left' ? -1 : 1, length);
  }
  const rowStart = Math.floor(safeIndex / stride) * stride;
  const rowEnd = Math.min(length - 1, rowStart + stride - 1);
  if (direction === 'left') return safeIndex === rowStart ? safeIndex : safeIndex - 1;
  if (direction === 'right') return safeIndex === rowEnd ? safeIndex : safeIndex + 1;
  if (direction === 'up') return rowStart === 0 ? safeIndex : safeIndex - stride;
  if (direction === 'down') {
    const finalRowStart = Math.floor((length - 1) / stride) * stride;
    if (rowStart === finalRowStart) return safeIndex;
    return Math.min(length - 1, safeIndex + stride);
  }
  return safeIndex;
}

