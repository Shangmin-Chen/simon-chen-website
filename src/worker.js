const GITHUB_USERNAME = 'Shangmin-Chen';
const GOODREADS_USER_ID = '141302044';
const GOODREADS_SHELF = 'currently-reading';
const GALLERY_MANIFEST_URL = 'https://images.simon-chen.com/gallery.json';

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

export default {
  async fetch(request, env, ctx) {
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
          { headers: { Accept: 'application/json' } }
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
        return new Response(JSON.stringify({ error: 'Fetch failed' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle contact form submissions
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json();

        if (!body.name || !body.email || !body.message || !body.subject) {
          return new Response(JSON.stringify({ error: 'Missing fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (env.SEND_EMAIL) {
          await env.SEND_EMAIL.send({
            to: [{ email: 'shangminch@gmail.com', name: 'Simon Chen' }],
            from: { email: 'website@simon-chen.com', name: body.name },
            replyTo: { email: body.email, name: body.name },
            subject: `[Contact Form] ${body.subject}`,
            text: `Name: ${body.name}\nEmail: ${body.email}\nSubject: ${body.subject}\n\nMessage:\n${body.message}`,
          });
        } else {
          // Fallback to EmailJS (e.g. local dry-run testing)
          const emailjsResponse = await fetch(
            'https://api.emailjs.com/api/v1.0/email/send',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                service_id: env.EMAILJS_SERVICE_ID,
                template_id: env.EMAILJS_TEMPLATE_ID,
                user_id: env.EMAILJS_PUBLIC_KEY,
                template_params: {
                  name: body.name,
                  email: body.email,
                  message: body.message,
                  subject: body.subject,
                },
              }),
            }
          );

          if (!emailjsResponse.ok) {
            const text = await emailjsResponse.text();
            return new Response(
              JSON.stringify({ error: 'Send failed', detail: text }),
              {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        return new Response(JSON.stringify({ error: 'Bad request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
