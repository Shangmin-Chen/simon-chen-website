import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';

const context = { waitUntil() {} };

test('invalid contact submissions are rejected before calling the mail transport', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected upstream call'); });
  for (const body of [null, [], 'invalid', {}, { name: 'Simon', email: 'wrong', subject: 'hello', message: 'hello' }]) {
    const response = await worker.fetch(new Request('https://portfolio.test/api/contact', { method: 'POST', body: JSON.stringify(body) }), {}, context);
    assert.equal(response.status, 400);
    assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test('contact limits still cap the actual request body', async () => {
  const response = await worker.fetch(new Request('https://portfolio.test/api/contact', { method: 'POST', body: 'x'.repeat(33 * 1024) }), {}, context);
  assert.equal(response.status, 413);
});

test('contact body limit cancels an oversized stream with an understated content length', async t => {
  let pulls = 0;
  let cancelled = false;
  const body = new ReadableStream({
    pull(controller) {
      pulls++;
      if (pulls === 1 || pulls === 2) controller.enqueue(new Uint8Array(16 * 1024));
      else controller.enqueue(new Uint8Array(pulls === 3 ? 1 : 1024));
    },
    cancel() { cancelled = true; },
  }, { highWaterMark: 0 });
  const request = new Request('https://portfolio.test/api/contact', {
    method: 'POST',
    headers: { 'content-length': '1' },
    body,
    duplex: 'half',
  });
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Oversized request must not reach mail transport'); });

  const response = await worker.fetch(request, {}, context);
  assert.equal(response.status, 413);
  assert.equal(fetch.mock.callCount(), 0);
  assert.equal(pulls, 3, 'the body reader must stop as soon as cumulative bytes exceed the limit');
  assert.equal(cancelled, true, 'the remaining request stream must be cancelled');
});

test('Worker sends sanitized values with server-only credentials and handles upstream failure', async t => {
  let outgoing;
  const fetch = t.mock.method(globalThis, 'fetch', async (url, init) => { outgoing = { url, body: JSON.parse(init.body) }; return new Response('OK'); });
  const request = () => new Request('https://portfolio.test/api/contact', { method: 'POST', body: JSON.stringify({ name: ' Simon ', email: 'simon@example.com', subject: ' hello ', message: ' message ' }) });
  const response = await worker.fetch(request(), { EMAILJS_SERVICE_ID: 'service', EMAILJS_TEMPLATE_ID: 'template', EMAILJS_PUBLIC_KEY: 'key' }, context);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(outgoing.url, 'https://api.emailjs.com/api/v1.0/email/send');
  assert.equal(outgoing.body.service_id, 'service');
  assert.equal(outgoing.body.template_params.name, 'Simon');
  fetch.mock.mockImplementation(async () => new Response('private upstream detail', { status: 500 }));
  const failed = await worker.fetch(request(), {}, context);
  assert.equal(failed.status, 502);
  assert(!JSON.stringify(await failed.json()).includes('private upstream detail'));
});

test('unknown API paths do not fall through to the SPA, but gallery deep links do', async () => {
  let assetCalls = 0;
  const env = { ASSETS: { fetch: async () => { assetCalls++; return new Response('<html>SPA</html>'); } } };
  const missing = await worker.fetch(new Request('https://portfolio.test/api/retired'), env, context);
  assert.equal(missing.status, 404);
  assert.equal(assetCalls, 0);
  const gallery = await worker.fetch(new Request('https://portfolio.test/gallery/shanghai-study-abroad'), env, context);
  assert.equal(gallery.status, 200);
  assert.equal(assetCalls, 1);
  const csp = gallery.headers.get('Content-Security-Policy');
  assert(csp.includes("connect-src 'self'"));
  assert(csp.includes("script-src 'self'"));
  assert(!csp.includes("script-src 'self' 'unsafe-inline'"));
  assert(csp.includes("style-src 'self' 'unsafe-inline'"));
});

test('GitHub and gallery malformed or incompatible JSON is not cached and valid data keeps its TTL', async t => {
  const previousCaches = Object.getOwnPropertyDescriptor(globalThis, 'caches');
  const entries = new Map();
  const puts = [];
  const cache = {
    async match(request) { return entries.get(request.url)?.clone(); },
    async put(request, response) {
      puts.push(request.url);
      entries.set(request.url, response.clone());
    },
  };
  Object.defineProperty(globalThis, 'caches', { configurable: true, value: { default: cache } });
  t.after(() => {
    if (previousCaches) Object.defineProperty(globalThis, 'caches', previousCaches);
    else delete globalThis.caches;
  });

  const bodies = new Map([
    ['/api/github-contributions', ['not-json', '{}', JSON.stringify({ contributions: [] })]],
    ['/api/gallery', ['not-json', 'null', JSON.stringify({ galleries: [] })]],
  ]);
  const fetch = t.mock.method(globalThis, 'fetch', async url => {
    const path = String(url).includes('github-contributions-api') ? '/api/github-contributions' : '/api/gallery';
    const bodyQueue = bodies.get(path);
    return new Response(bodyQueue.shift(), { headers: { 'Content-Type': 'application/json' } });
  });
  const pendingCacheWrites = [];
  const cacheContext = { waitUntil(promise) { pendingCacheWrites.push(promise); } };

  for (const [path, ttl] of [['/api/github-contributions', 'max-age=3600'], ['/api/gallery', 'max-age=300']]) {
    const makeRequest = () => new Request(`https://portfolio.test${path}`);
    const cachedWritesBefore = puts.length;
    const malformed = await worker.fetch(makeRequest(), {}, cacheContext);
    assert.equal(malformed.status, 502);
    assert.equal(puts.length, cachedWritesBefore, `${path} malformed body must not be cached`);

    const incompatible = await worker.fetch(makeRequest(), {}, cacheContext);
    assert.equal(incompatible.status, 502);
    assert.equal(puts.length, cachedWritesBefore, `${path} incompatible JSON shape must not be cached`);

    const valid = await worker.fetch(makeRequest(), {}, cacheContext);
    assert.equal(valid.status, 200);
    assert.equal(valid.headers.get('Cache-Control'), `public, ${ttl}`);
    await Promise.all(pendingCacheWrites.splice(0));
    assert.equal(puts.length, cachedWritesBefore + 1);

    const cached = await worker.fetch(makeRequest(), {}, cacheContext);
    assert.equal(cached.status, 200);
    assert.equal(fetch.mock.callCount(), path === '/api/github-contributions' ? 3 : 6);
    assert.equal(puts.length, cachedWritesBefore + 1);
  }
});
