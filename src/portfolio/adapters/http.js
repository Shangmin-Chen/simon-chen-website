import { createCachedResource } from './cachedResource.js';
import { isGithubResponse, isGoodreadsResponse, isGalleryResponse } from './responseSchemas.js';

export function createPortfolioServices({ fetch: request, storage, now }) {
  const get = async path => {
    const response = await request(path, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Connection failed. Please try again.');
    return response.json();
  };
  const resource = (key, ttl, path, valid) => createCachedResource({ key, ttl, storage, now, valid, fetchData: () => get(path) });
  return {
    github: resource('portfolio:github:v1', 3600000, '/api/github-contributions', isGithubResponse),
    goodreads: resource('portfolio:goodreads:v1', 3600000, '/api/goodreads', isGoodreadsResponse),
    gallery: resource('portfolio:gallery:v1', 300000, '/api/gallery', isGalleryResponse),
    async sendMessage(values) {
      const response = await request('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(15000),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.success !== true) {
        const fieldError = Object.values(body.fields ?? {}).find(value => typeof value === 'string');
        throw new Error(fieldError || body.error || 'Message could not be sent. Please try again.');
      }
    },
  };
}
