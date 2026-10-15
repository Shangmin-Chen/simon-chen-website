const GAP = 8;
const MINIMUM_SLOT_WIDTH = 156;

export function inventoryLayout(width, height, itemCount = 0) {
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0;
  const safeHeight = Number.isFinite(height) ? Math.max(0, height) : 0;
  const count = Number.isFinite(itemCount) ? Math.max(0, Math.floor(itemCount)) : 0;
  const minimumSlotWidth = Math.min(safeWidth, MINIMUM_SLOT_WIDTH);
  const minimumSlotHeight = 184;
  const fitColumns = Math.max(1, Math.floor((safeWidth + GAP) / (MINIMUM_SLOT_WIDTH + GAP)));
  const columns = Math.min(Math.max(1, count), fitColumns);

  return { columns, minimumSlotWidth, minimumSlotHeight, width: safeWidth, height: safeHeight };
}
