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

export function cardPageStart(index, pageSize, length) {
  if (!Number.isInteger(length) || length < 1) return -1;
  const size = Math.max(1, Math.floor(pageSize) || 1);
  const safeIndex = Math.max(0, Math.min(length - 1, Number.isInteger(index) ? index : 0));
  return Math.floor(safeIndex / size) * size;
}

export function cardPageIndex(index, pageSize, length) {
  const start = cardPageStart(index, pageSize, length);
  return start < 0 ? -1 : start / Math.max(1, Math.floor(pageSize) || 1);
}

export function cardIndexOnPage(pageIndex, pageSize, length) {
  if (!Number.isInteger(length) || length < 1) return -1;
  const size = Math.max(1, Math.floor(pageSize) || 1);
  const pageCount = Math.ceil(length / size);
  const safePage = Math.max(0, Math.min(pageCount - 1, Number.isInteger(pageIndex) ? pageIndex : 0));
  return safePage * size;
}

