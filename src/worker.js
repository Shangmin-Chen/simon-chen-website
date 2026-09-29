const GITHUB_USERNAME = 'Shangmin-Chen';
const GOODREADS_USER_ID = '141302044';
const GOODREADS_SHELF = 'currently-reading';
const GALLERY_MANIFEST_URL = 'https://images.simon-chen.com/gallery.json';
const CODEFORCES_HANDLE = 'simonlovestocode';
const UPSTREAM_TIMEOUT_MS = 5000;

// Security headers applied to every outgoing response (API JSON + assets).
// NOTE: 'unsafe-inline' in script-src/style-src is required by a companion PR
// adding an inline theme bootstrap script in index.html — do not remove.
const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://images.simon-chen.com https://i.gr-assets.com https://books.google.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Attach security headers to a response without clobbering existing values
// (idempotent). Our own API responses have mutable headers — set them in
// place; asset responses arrive immutable, so fall back to rebuilding a new
// Response from body + init to get writable headers.
function withSecurityHeaders(res) {
  const apply = (headers) => {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      if (!headers.has(name)) headers.set(name, value);
    }
  };
  try {
    apply(res.headers);
    return res;
  } catch {
    const headers = new Headers(res.headers);
    apply(headers);
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  }
}

// Pull the inner text of a single XML tag, unwrapping CDATA and trimming.
function extractTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  if (!m) return '';
  return m[1]
    .replace(/^\s*<!\[CDATA\[/, '')
    .replace(/\]\]>\s*$/, '')
    .trim();
}

// Goodreads only exposes a shelf as an RSS (XML) feed — parse the handful of
// fields we render into a small JSON shape. The currently-reading shelf is
// tiny, so a regex pass is plenty (and keeps the Worker dependency-free).
function parseGoodreadsRss(xml) {
  const books = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];
    const cover =
      extractTag(block, 'book_large_image_url') ||
      extractTag(block, 'book_medium_image_url') ||
      extractTag(block, 'book_image_url') ||
      extractTag(block, 'book_small_image_url');
    books.push({
      id: extractTag(block, 'book_id'),
      title: extractTag(block, 'title'),
      author: extractTag(block, 'author_name'),
      cover,
      link: extractTag(block, 'link'),
      rating: Number(extractTag(block, 'user_rating')) || 0,
    });
  }
  return books;
}

// Fetch one Codeforces API endpoint and return its parsed body, or null on
// ANY failure mode (non-2xx HTTP, non-OK status field, network/timeout error)
// so a single-endpoint outage can be tolerated independently.
async function fetchCodeforcesJson(url) {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.status === 'OK' ? data : null;
  } catch {
    // Includes AbortError/TimeoutError from the upstream timeout above.
    return null;
  }
}

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);

  // Proxy GitHub contribution data server-side to avoid browser CORS, with
  // an edge-cached response so we don't hammer the upstream API.
  if (url.pathname === '/api/github-contributions' && request.method === 'GET') {
    const cache = caches.default;
    const cacheKey = new Request(new URL('/api/github-contributions', url.origin), request);

    const hit = await cache.match(cacheKey);
    if (hit) return hit;

    try {
      const upstream = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`,
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        }
      );

      if (!upstream.ok) {
        return new Response(JSON.stringify({ error: 'Upstream error' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const response = new Response(await upstream.text(), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      });
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch {
      // Includes AbortError/TimeoutError from the upstream timeout above.
      return new Response(JSON.stringify({ error: 'Fetch failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Proxy the Goodreads shelf RSS server-side: the feed isn't CORS-enabled,
  // and Goodreads retired its public API, so RSS is the only route. Parse to
  // JSON and edge-cache so the client gets clean data without hammering them.
  if (url.pathname === '/api/goodreads' && request.method === 'GET') {
    const cache = caches.default;
    const cacheKey = new Request(new URL('/api/goodreads', url.origin), request);

    const hit = await cache.match(cacheKey);
    if (hit) return hit;

    try {
      const upstream = await fetch(
        `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=${GOODREADS_SHELF}`,
        {
          headers: {
            // Goodreads rejects requests without a browser-like UA.
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
            Accept: 'application/rss+xml, application/xml, text/xml',
          },
          signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        }
      );

      if (!upstream.ok) {
        return new Response(
          JSON.stringify({ error: 'Upstream error', status: upstream.status }),
          {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const books = parseGoodreadsRss(await upstream.text());
      const response = new Response(JSON.stringify({ books }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      });
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch {
      // Includes AbortError/TimeoutError from the upstream timeout above.
      return new Response(JSON.stringify({ error: 'Fetch failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Proxy the gallery manifest (gallery.json) from the public R2 domain so
  // the client stays same-origin (no CORS) and the manifest is edge-cached.
  // Short TTL so photo/caption edits propagate without a redeploy.
  if (url.pathname === '/api/gallery' && request.method === 'GET') {
    const cache = caches.default;
    const cacheKey = new Request(new URL('/api/gallery', url.origin), request);

    const hit = await cache.match(cacheKey);
    if (hit) return hit;

    try {
      const upstream = await fetch(GALLERY_MANIFEST_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });

      if (!upstream.ok) {
        return new Response(
          JSON.stringify({ error: 'Upstream error', status: upstream.status }),
          {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const response = new Response(await upstream.text(), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      });
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch {
      // Includes AbortError/TimeoutError from the upstream timeout above.
      return new Response(JSON.stringify({ error: 'Fetch failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Proxy Codeforces profile + rating history server-side: same-origin for
  // the client (no CORS surprises), edge-cached for 6h since rating data
  // changes slowly. Fetches user.info and user.rating in parallel.
  if (url.pathname === '/api/codeforces' && request.method === 'GET') {
    const cache = caches.default;
    const cacheKey = new Request(new URL('/api/codeforces', url.origin), request);

    const hit = await cache.match(cacheKey);
    if (hit) return hit;

    try {
      const [infoData, ratingData] = await Promise.all([
        fetchCodeforcesJson(`https://codeforces.com/api/user.info?handles=${CODEFORCES_HANDLE}`),
        fetchCodeforcesJson(`https://codeforces.com/api/user.rating?handle=${CODEFORCES_HANDLE}`),
      ]);

      // Tolerate a single-endpoint failure (the old client rendered ratings
      // even when user.info was down); both failing is a real outage → 502.
      if (!infoData && !ratingData) {
        return new Response(JSON.stringify({ error: 'Upstream error' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Scale the cache TTL by response completeness: a degraded response
      // (one endpoint down) must not pin the degradation at every PoP for
      // 6h — retry after a short window instead.
      const complete = infoData && ratingData;
      const response = new Response(
        JSON.stringify({
          user: infoData?.result?.[0] ?? null,
          ratings: ratingData?.result ?? [],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${complete ? 21600 : 300}`,
          },
        }
      );
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch {
      // Includes AbortError/TimeoutError from the upstream timeouts above.
      return new Response(JSON.stringify({ error: 'Fetch failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Handle contact form submissions
  if (url.pathname === '/api/contact' && request.method === 'POST') {
    // Reject oversized bodies before parsing. The header check below is only
    // a cheap fast-path — the authoritative cap is applied to the actual byte
    // count after buffering, so chunked/telescoped bodies without a truthful
    // content-length can't bypass it.
    const MAX_CONTACT_BODY_BYTES = 32 * 1024;
    const lenHeader = request.headers.get('content-length');
    const contentLength = lenHeader !== null ? Number.parseInt(lenHeader, 10) : NaN;
    if (Number.isFinite(contentLength) && contentLength > MAX_CONTACT_BODY_BYTES) {
      return new Response(JSON.stringify({ error: 'Request body too large' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const bodyBytes = await request.arrayBuffer();
      if (bodyBytes.byteLength > MAX_CONTACT_BODY_BYTES) {
        return new Response(JSON.stringify({ error: 'Request body too large' }), {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const raw = JSON.parse(new TextDecoder().decode(bodyBytes));

      // Reject non-object bodies (arrays, strings, numbers, null) safely.
      if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Trim up front so length caps and EmailJS receive sanitized values.
      const name = typeof raw.name === 'string' ? raw.name.trim() : '';
      const email = typeof raw.email === 'string' ? raw.email.trim() : '';
      const subject = typeof raw.subject === 'string' ? raw.subject.trim() : '';
      const message = typeof raw.message === 'string' ? raw.message.trim() : '';

      // Simple pragmatic email check — mirrors the client-side regex.
      const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const fields = {};
      if (!name) fields.name = 'Name is required.';
      else if (name.length > 100) fields.name = 'Name must be 100 characters or fewer.';
      if (!email) fields.email = 'Email is required.';
      else if (email.length > 254) fields.email = 'Email must be 254 characters or fewer.';
      else if (!EMAIL_RE.test(email)) fields.email = 'Email address is invalid.';
      if (!subject) fields.subject = 'Subject is required.';
      else if (subject.length > 200) fields.subject = 'Subject must be 200 characters or fewer.';
      if (!message) fields.message = 'Message is required.';
      else if (message.length > 5000) fields.message = 'Message must be 5000 characters or fewer.';

      if (Object.keys(fields).length > 0) {
        return new Response(JSON.stringify({ error: 'Validation failed', fields }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        body: JSON.stringify({
          service_id: env.EMAILJS_SERVICE_ID,
          template_id: env.EMAILJS_TEMPLATE_ID,
          user_id: env.EMAILJS_PUBLIC_KEY,
          template_params: { name, email, subject, message },
        }),
      });

      if (!emailjsResponse.ok) {
        // Don't echo upstream EmailJS error text back to the client (it can
        // leak internals); no logger available here, so drop the detail.
        return new Response(JSON.stringify({ error: 'Failed to send message' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      // Upstream timeout — not the client's fault, surface as bad gateway.
      if (err && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
        return new Response(JSON.stringify({ error: 'Failed to send message' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Bad request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env, ctx) {
    // Every outgoing response — API JSON, errors, and static assets — passes
    // through the security-header wrapper exactly once.
    return withSecurityHeaders(await handleRequest(request, env, ctx));
  },
};
