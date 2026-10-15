const GAP = 8;

/**
 * Pick one presentation policy for both the CSS grid and spatial navigation.
 * `width` and `height` are the rack's usable content bounds after its padding.
 */
export function inventoryLayout(width, height, itemsOrCount = []) {
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0;
  const safeHeight = Number.isFinite(height) ? Math.max(0, height) : 0;
  const items = Array.isArray(itemsOrCount) ? itemsOrCount : [];
  const count = Array.isArray(itemsOrCount)
    ? items.length
    : Number.isFinite(itemsOrCount) ? Math.max(0, Math.floor(itemsOrCount)) : 0;
  const kinds = new Set(items.map(item => item.kind ?? (item.photo ? 'photo' : 'text')));
  const kind = kinds.size === 1 ? [...kinds][0] : 'text';
  const minimumSlotWidth = kind === 'photo' ? 152 : kind === 'dossier' ? 240 : 196;
  const minimumSlotHeight = kind === 'photo'
    ? safeHeight < 300 ? 184 : safeHeight < 480 ? 220 : 248
    : kind === 'dossier' ? 178 : 148;
  const fitColumns = Math.max(1, Math.floor((safeWidth + GAP) / (minimumSlotWidth + GAP)));
  const preferredColumns = kind === 'dossier' ? 1 : 2;
  const columns = count ? Math.min(count, fitColumns, preferredColumns) : 1;
  const fitRows = Math.max(1, Math.floor((safeHeight + GAP) / (minimumSlotHeight + GAP)));
  const requiredRows = Math.ceil((count || 1) / columns);
  const rows = kind === 'dossier' ? requiredRows : Math.min(requiredRows, fitRows);

  return {
    columns,
    count,
    kind,
    minimumSlotWidth: Math.min(safeWidth, minimumSlotWidth),
    minimumSlotHeight,
    rows,
    width: safeWidth,
    height: safeHeight,
  };
}
