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
  assert(gallery.headers.get('Content-Security-Policy').includes("connect-src 'self'"));
});
