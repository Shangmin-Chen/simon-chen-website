import test from 'node:test';
import assert from 'node:assert/strict';
import { createCachedResource } from '../src/portfolio/adapters/cachedResource.js';
import { createPortfolioServices } from '../src/portfolio/adapters/http.js';
import { browserStorage } from '../src/portfolio/adapters/storage.js';
import { isGalleryResponse, isGoodreadsResponse, isGoodreadsUrl, isGithubResponse } from '../src/portfolio/adapters/responseSchemas.js';

test('cache deduplicates concurrent callers and expires both memory and persisted data', async () => {
  let clock = 1000;
  let calls = 0;
  const entries = new Map();
  const options = {
    key: 'test', ttl: 100, now: () => clock, valid: Array.isArray,
    storage: { read: key => entries.get(key), write: (key, value) => entries.set(key, value) },
    fetchData: async () => [++calls],
  };
  const first = createCachedResource(options);
  const a = first.load();
  assert.equal(a, first.load());
  assert.deepEqual(await a, [1]);
  assert.deepEqual(await first.load(), [1]);
  assert.deepEqual(await createCachedResource(options).load(), [1]);
  assert.equal(calls, 1);
  clock += 100;
  assert.deepEqual(await first.load(), [2]);
  clock += 100;
  assert.deepEqual(await createCachedResource(options).load(), [3]);
});

test('resource errors and malformed data can be retried without poisoning cache', async () => {
  let calls = 0;
  const resource = createCachedResource({ key: 'test', ttl: 100, valid: Array.isArray, fetchData: async () => ++calls === 1 ? {} : ['recovered'] });
  const states = [];
  const stop = resource.subscribe(() => states.push(resource.getSnapshot().status));
  assert.equal(await resource.load(), null);
  assert.equal(resource.getSnapshot().status, 'error');
  assert.deepEqual(await resource.load(), ['recovered']);
  assert.deepEqual(states, ['loading', 'error', 'loading', 'ready']);
  stop();
});

test('browser storage is optional, including when the storage getter throws', () => {
  const storage = browserStorage(() => { throw new Error('denied'); });
  assert.equal(storage.read('anything'), null);
  assert.doesNotThrow(() => storage.write('anything', true));
});

test('HTTP resources use only relative API paths and validate response bodies', async () => {
  const paths = [];
  const services = createPortfolioServices({ fetch: async path => {
    paths.push(path);
    return Response.json(path.includes('github') ? { contributions: [] } : path.includes('goodreads') ? { books: [] } : { galleries: [] });
  } });
  await Promise.all([services.github.load(), services.goodreads.load(), services.gallery.load()]);
  assert.deepEqual(paths.sort(), ['/api/gallery', '/api/github-contributions', '/api/goodreads']);
  const failed = createPortfolioServices({ fetch: async () => new Response('bad', { status: 502 }) });
  assert.equal(await failed.github.load(), null);
  assert.equal(failed.github.getSnapshot().status, 'error');
});

test('contact transport rejects failed or unconfirmed sends and propagates field errors', async () => {
  const failed = createPortfolioServices({ fetch: async () => Response.json({ fields: { email: 'Invalid email.' } }, { status: 400 }) });
  await assert.rejects(failed.sendMessage({}), /Invalid email/);
  const unconfirmed = createPortfolioServices({ fetch: async () => Response.json({}) });
  await assert.rejects(unconfirmed.sendMessage({}), /could not be sent/);
  let sent;
  const success = createPortfolioServices({ fetch: async (path, init) => {
    sent = { path, ...init };
    return Response.json({ success: true });
  } });
  await success.sendMessage({ name: 'Simon' });
  assert.equal(sent.path, '/api/contact');
  assert.equal(sent.method, 'POST');
  assert.deepEqual(JSON.parse(sent.body), { name: 'Simon' });
});

test('malformed API records are rejected before caching or reaching React', async () => {
  assert(!isGithubResponse({ contributions: [null] }));
  assert(!isGithubResponse({ contributions: [{ date: '2026-10-13', count: '7', level: 2 }] }));
  assert(!isGoodreadsResponse({ books: [null] }));
  for (const url of ['javascript:alert(1)', 'https://goodreads.com.evil.test/', 'https://evil.test/', 'http://www.goodreads.com/']) assert(!isGoodreadsUrl(url));
  assert(isGoodreadsUrl('https://www.goodreads.com/review/show/123'));
  for (const galleries of [[null], [42], [{ id: 'album', title: 'Album', photos: 'invalid' }], [{ id: 'album', title: 'Album', photos: [null] }]]) assert(!isGalleryResponse({ galleries }));
  const album = { id: 'album', title: 'Album', photos: [{ full: 'album/photo-full.jpg', caption: 'A photo' }] };
  assert(isGalleryResponse({ galleries: [album] }));
  assert(!isGalleryResponse({ galleries: [album, album] }));
  const services = createPortfolioServices({ fetch: async () => Response.json({ galleries: [null] }) });
  assert.equal(await services.gallery.load(), null);
  assert.equal(services.gallery.getSnapshot().status, 'error');
});
