const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// The deck reserves space for paging and its keyboard hint even on a single
// page, so capacity cannot oscillate when the pager appears or disappears.
export function inventoryLayout(width, height, itemCount = Infinity) {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const available = Math.max(0, safeHeight - 48);
  const wide = safeWidth >= 560;
  const columns = 1;
  const candidatePreviewHeight = wide ? 0 : Math.min(available, clamp(Math.round(available * 0.38), 86, 170), Math.max(0, available - 102));
  const showPreview = wide || candidatePreviewHeight >= 80;
  const previewHeight = showPreview && !wide ? candidatePreviewHeight : 0;
  const rackHeight = wide ? available : Math.max(0, available - (showPreview ? previewHeight + 12 : 0));
  const rowHeight = wide ? clamp(rackHeight - 34, 1, 86) : clamp(rackHeight - 34, 1, 64);
  const rackRowsHeight = Math.max(0, rackHeight - 34);
  const rows = clamp(Math.floor((rackRowsHeight + 4) / (rowHeight + 4)), 1, wide ? 5 : 3);
  const capacity = Math.max(1, Math.min(columns * rows, Number.isFinite(itemCount) ? Math.max(1, itemCount) : columns * rows));
  return { wide, showPreview, columns, rows, capacity, previewHeight, slotHeight: rowHeight, rackHeight, availableHeight: available };
}
