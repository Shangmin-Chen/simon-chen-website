// Static config for the photo gallery. The album/photo data itself lives in
// gallery.json in R2 (served via the /api/gallery Worker proxy) so photos can
// be added without a redeploy; this file only holds constants + the helper
// that resolves a photo key against the public R2 domain.
export const galleryConfig = {
  // Public R2 custom domain. Photo `full`/`thumb` keys resolve against this.
  imageBase: 'https://images.simon-chen.com',
  note: 'A few frames',
  messages: {
    loading: 'Loading gallery…',
    error: 'Could not load the gallery:',
    empty: 'No photos here yet.',
  },
};

export const imageUrl = (key) => {
  if (!key) return '';
  const cleanKey = String(key)
    .replace(/^\/+/, '')
    .replace(/\.\.\//g, '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${galleryConfig.imageBase}/${cleanKey}`;
};
