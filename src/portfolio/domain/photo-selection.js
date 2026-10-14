export function normalizePhotoIndex(index, photoCount) {
  if (!Number.isInteger(photoCount) || photoCount <= 0) return null;
  const value = Number.isFinite(index) ? Math.trunc(index) : 0;
  return Math.min(photoCount - 1, Math.max(0, value));
}

export function restorePhotoIndex(selectionByAlbum, albumId, photoCount) {
  return normalizePhotoIndex(selectionByAlbum?.[albumId] ?? 0, photoCount);
}
