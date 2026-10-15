const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function inventoryLayout(width, height) {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const wide = safeWidth >= 560;
  const columns = 1;
  // Keep a fixed budget for the frame header, controls, hint, and layout inset.
  const availableHeight = Math.max(0, safeHeight - (wide ? 89 : 85));
  const candidatePreviewHeight = wide
    ? 0
    : Math.min(availableHeight, clamp(Math.round(availableHeight * 0.38), 86, 170), Math.max(0, availableHeight - 64 - 7));
  const showPreview = wide || candidatePreviewHeight >= 80;
  const previewHeight = showPreview && !wide ? candidatePreviewHeight : 0;
  const rackHeight = wide ? availableHeight : Math.max(0, availableHeight - (showPreview ? previewHeight + 7 : 0));
  const minimumSlotHeight = Math.min(wide ? 58 : 52, Math.max(1, rackHeight));

  return {
    wide,
    showPreview,
    columns,
    previewHeight,
    rackHeight,
    minimumSlotHeight,
    availableHeight,
    width: safeWidth,
    height: safeHeight,
  };
}
