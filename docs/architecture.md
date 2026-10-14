# Portfolio architecture

The portfolio uses practical hexagonal boundaries. Pure behavior is independent
of browser APIs; React application hooks accept ports; adapters implement the
external dependencies. `src/App.jsx` is the composition root.

```text
src/portfolio/
  domain/       navigation, wheel geometry, media sizing/orientation, ASCII frames and glitch plans, contributions, validation
  application/  resource subscriptions and contact submission use case
  adapters/     same-origin HTTP, TTL resource cache, optional browser storage
  ui/           React shell, reader primitives, media stage, crew wheel, portrait, intro, section views
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
`#now` to hobbies. Browser Back restores the selected character. ContentPanel
keeps selected file IDs and opener IDs per section while rendering only the
active Whoami, Projects, or Hobbies body. The Contact frame and Pictures
container remain mounted while hidden, preserving form drafts and per-album
photo selections. Each section has a compact, data-backed home index; selecting
a file opens a ReaderFrame with shared breadcrumb, title, Back, and footer
SequenceNavigation. Text files read in a naturally scrollable, visually
scrollbar-free body, with long prose kept near 68 characters per line; the
GitHub graph retains its useful width. Gallery uses the same frame with a
bounded media body. MediaStage measures available space and loaded source
dimensions; pure `media-orientation` helpers classify orientation and contain
fit without upscaling. The document never scrolls. Gallery photos remain actual
R2 content and use the existing accessible touch/zoom lightbox.

Portrait animation is local to its component. It updates at 65ms, pauses in
background tabs, cleans up timers/listeners, and never changes page position.
Eye movement copies the original iris inside its eyelid mask; Maine's visor
stays intact. The pure domain glitch plan translates bounded horizontal bands
without wrapping and keeps glyph/color cells together; each band reuses one
sampled source timestamp during its cadence before jumping ahead or behind.
It also supplies deterministic signal colors and shared wash/speckle masks;
the UI maps those signals to portrait palette slots or semantic CSS tokens.
Intro and portrait consume the same cadence. Intro and
wheel transitions honor system reduced motion and
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
