# Portfolio architecture

The portfolio uses practical hexagonal boundaries. Pure behavior is independent
of browser APIs; React application hooks accept ports; adapters implement the
external dependencies. `src/App.jsx` is the composition root.

```text
src/portfolio/
  domain/       navigation, card paging, wheel geometry, photo selection, Unicode decode frames, ASCII frames and glitch plans, contributions, validation
  application/  resource subscriptions and contact submission use case
  adapters/     same-origin HTTP, TTL resource cache, optional browser storage
  ui/           React shell, card deck and inspection reader, crew wheel, portrait, intro, section views
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
retains a selected card ID per section. Whoami keeps the short bio visible above
cards for the two experience roles and live GitHub activity; Projects and
Hobbies use the same deck. One activation opens an in-scene InspectPanel over
the card area, with a shared ReaderFrame, breadcrumb, Close/Escape behavior,
and previous/next card controls. The character art and crew wheel keep the same
geometry while a card is inspected. Text reads in a naturally scrollable,
visually scrollbar-free body, with long prose kept near 68 characters per line;
the GitHub graph keeps its useful width. CardDeck pages actual cards to fit the
available area and supports roving keyboard selection, Enter activation,
wheel/swipe paging, and PageUp/PageDown. Contact opens directly to its mounted
form, preserving drafts and validation while hidden. Pictures retains its
album/photo selections and uses actual R2 thumbnails; choosing a photo opens
the existing accessible touch/zoom Lightbox directly. The document never
scrolls. A shared wheel output ref gives each card deck a measured geometric
fan from the selected crew rail; connectors follow real card and hub positions
instead of a detached background grid. The crew output pulse and selection
frame are local CSS motion under the shell's visibility-aware `data-ambient`
boundary.

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

Card and inspection signals use the shared pure glitch planner. Their UI bursts
are local, bounded, visibility-aware, and disabled by reduced motion or the
motion toggle; text decode frames preserve grapheme and whitespace boundaries,
while the original title and caption stay semantic and readable to assistive
technology.

Card fans use measured DOM anchors and static connector geometry; the hub ref
is passed through the UI composition path to text and gallery decks. The crew
selection frame and output port use slow compositor transforms/opacity under
the shell's visibility-aware `data-ambient` boundary. No animation tick
rerenders the shell or moves navigation targets.

Validation: `npm run lint`, `npm run verify` (Node tests + build + token checks),
and UI checks using the Cloudflare development Worker on port 8787. Node tests
cover navigation wraparound, frame integrity/immutability, contribution dates,
validation parity, cache TTL/deduplication/recovery, and HTTP/Worker contracts.
