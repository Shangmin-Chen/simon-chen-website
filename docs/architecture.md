# Portfolio architecture

The portfolio uses practical hexagonal boundaries. Pure behavior is independent
of browser APIs; React application hooks accept ports; adapters implement the
external dependencies. `src/App.jsx` is the composition root.

```text
src/portfolio/
  domain/       navigation, paging, wheel geometry, ASCII frames, contributions, validation
  application/  resource subscriptions and contact submission use case
  adapters/     same-origin HTTP, TTL resource cache, optional browser storage
  ui/           React shell, crew wheel, portrait, intro, section views
  assets/       character grids, palettes, eye masks, approved intro glyph
src/data/       actual projects, experience, links, integration configuration
src/worker.js   Cloudflare API proxy and contact transport
```

Dependencies point toward the domain. Domain modules import no React, DOM,
router, storage, or network code. Application hooks depend on port contracts,
not concrete adapters. UI receives services through props; it never fetches.
The Worker shares pure contact validation with the browser, and retains its
body cap, upstream timeout, edge cache, and security headers.

A resource port implements `getSnapshot()`, `subscribe(listener)`, and `load()`.
Snapshots contain `{data, status, error}`. HTTP adapters validate response
shapes; the cache deduplicates concurrent requests and applies TTL to memory
and session storage. Storage failures are tolerated. Errors support explicit
retry; no preview data is shipped. `sendMessage(values)` resolves on confirmed
success and throws on failure. Tests inject transports, storage, and clocks.

The router is a UI adapter: `/#whoami`, `/#projects`, `/#hobbies`, `/#contact`,
`/gallery`, and `/gallery/:albumId`. Legacy `#gallery` maps to pictures and
`#now` to hobbies. Browser Back restores the selected character. Section views
stay mounted and use `hidden`, preserving contact drafts and file expansion.
The content buffer is a fixed paging window with previous/next controls; wheel,
PageUp/PageDown, touch swipes, and keyboard focus move between discrete pages.
Page boundaries are measured from rendered content height and recomputed when
details expand, resources load, or the viewport changes. Page positions are
retained per section and album while views stay mounted. The document never
scrolls. Gallery photos remain actual R2 content and
use the existing accessible touch/zoom lightbox; all new decorative assets
are character data and CSS textures.

Portrait animation is local to its component. It updates at 65ms, pauses in
background tabs, cleans up timers/listeners, and never changes page position.
Eye movement copies the original iris inside its eyelid mask; Maine's visor
stays intact. Intro and wheel transitions honor system reduced motion and
the saved motion toggle. The intro makes the shell inert, traps focus on the
skip button, then restores focus. Keyboard wheel controls use native buttons.

API routes: GitHub and Goodreads cache for 3600s, gallery for 300s, and contact
POST is uncached. All client requests stay under `/api/*`; secrets remain in
the Worker. Unknown API paths return JSON 404 instead of the SPA.

CSS preserves the three-layer HSL token architecture. Portrait palette values
are sampled channels in asset data, exposed as CSS variables at one boundary.
No hardcoded HEX/RGB colors belong in component CSS.

Validation: `npm run lint`, `npm run verify` (Node tests + build + token checks),
and UI checks using the Cloudflare development Worker on port 8787. Node tests
cover navigation wraparound, frame integrity/immutability, contribution dates,
validation parity, cache TTL/deduplication/recovery, and HTTP/Worker contracts.
