const genericCaption = /^(?:[^,]+,\s*)?photo\s+\d+$/i;

export function photoAlt(photo) {
  const alt = typeof photo?.alt === 'string' ? photo.alt.trim() : '';
  if (alt && !genericCaption.test(alt)) return alt;
  const caption = typeof photo?.caption === 'string' ? photo.caption.trim() : '';
  if (caption && !genericCaption.test(caption)) return caption;
  const location = typeof photo?.location === 'string' ? photo.location.trim() : '';
  return location ? `${location} photograph` : 'Photograph';
}
