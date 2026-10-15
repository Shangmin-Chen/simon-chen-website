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
  const offset = direction === 'left' ? -1 : direction === 'right' ? 1 : direction === 'up' ? -stride : direction === 'down' ? stride : 0;
  return moveCardIndex(index, offset, length);
}

