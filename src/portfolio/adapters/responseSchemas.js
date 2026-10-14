const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const optionalText = value => value == null || typeof value === 'string';

export function isGithubResponse(data) {
  return Array.isArray(data?.contributions) && data.contributions.every(day => record(day)
    && /^\d{4}-\d{2}-\d{2}$/.test(day.date)
    && Number.isInteger(day.count) && day.count >= 0
    && Number.isInteger(day.level) && day.level >= 0 && day.level <= 4);
}

export function isGoodreadsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['goodreads.com', 'www.goodreads.com'].includes(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

export function isGoodreadsResponse(data) {
  return Array.isArray(data?.books) && data.books.every(book => record(book)
    && optionalText(book.id) && text(book.title) && typeof book.author === 'string' && isGoodreadsUrl(book.link));
}

export function isGalleryResponse(data) {
  if (!Array.isArray(data?.galleries)) return false;
  const ids = new Set();
  return data.galleries.every(album => {
    if (!record(album) || !text(album.id) || !text(album.title) || !optionalText(album.description) || !Array.isArray(album.photos) || ids.has(album.id)) return false;
    ids.add(album.id);
    return album.photos.every(photo => record(photo) && text(photo.full)
      && optionalText(photo.thumb) && optionalText(photo.alt) && optionalText(photo.caption) && optionalText(photo.location));
  });
}
