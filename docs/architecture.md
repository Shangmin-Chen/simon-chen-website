# Portfolio architecture

The portfolio uses practical hexagonal boundaries. Pure behavior is independent
of browser APIs; React application hooks accept ports; adapters implement the
external dependencies. `src/App.jsx` is the composition root.

```text
src/portfolio/
  domain/       navigation, inventory layout, wheel geometry, photo selection, Unicode decode frames, ASCII frames and glitch plans, contributions, validation
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
Hobbies use the same deck. Project purpose, detail, technology tags and metadata
map from project data to two stacked typographic dossiers; the reader retains
the full project descriptions. Whoami experience records also map their local
official company marks into supporting card and reader identity. One activation
opens an in-scene InspectPanel over the card area, with a shared ReaderFrame,
breadcrumb, Close/Escape behavior,
and previous/next card controls. The character art and radial crew wheel keep
the same geometry while a card is inspected. The desktop wheel shows five radial
options; compact contexts center the selected option while arrows, number keys,
Previous/Next, drag and wheel input keep every section reachable. The wheel uses
responsive square geometry from the shared sizing policy, with static token-based
concentric outlines behind the existing ASCII rail. Text reads in
a naturally scrollable,
visually scrollbar-free body, with long prose kept near 68 characters per line;
the GitHub graph keeps its useful width. CardDeck presents each collection as a
game inventory inside one perimeter frame. The pure inventory presentation
policy receives the rack's usable width and height, item kinds and count, then
supplies columns and visible rows to both the rendered CSS grid and spatial
keyboard navigation. Projects stay in one column; photo slots use up to two
columns when their width remains comfortable. Real photo cards show contained
R2 thumbnails, a brief location/caption and the actual caption as their
accessible name. Longer collections scroll inside the fixed frame. Hover never
changes retained selection; one click or Enter opens an item directly. Arrow
keys navigate by rendered grid position, Home and End reach the list bounds,
and the selected slot scrolls into view. Wheel and touch use native scrolling.
Returning focus or mounting a section reveals the selected slot without moving
focus. A restrained perimeter trace follows the inventory frame. Contact is a
one-item comms inventory;
opening its ASCII
letter slot overlays a `LetterComposer` in the same scene. The existing
`useContact` submission and validation remain in place, the component stays
mounted while another character is active, and closing the letter returns
focus to its slot without discarding the draft. The letter form keeps social
profiles visible and only reports a sent receipt after the service succeeds.
Pictures retains its album/photo selections and uses actual R2 thumbnails; choosing a photo opens
the existing accessible touch/zoom Lightbox directly. The document never
scrolls. The crew selection frame is local CSS motion under the shell's
visibility-aware `data-ambient` boundary. Inspector and letter panels use a
brief masked reveal only on an actual open transition when effective motion is
enabled; focus, controls, and content are available without waiting for it, and
motion preference changes do not replay an already-open panel.

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

Portrait, intro, and title/caption decode effects use the shared pure glitch
planner. Their bounded UI effects respect reduced motion and the shell's motion
toggle; text decode frames preserve grapheme and whitespace boundaries while
the original title and caption stay semantic and readable to assistive
technology.

Inventory layouts use bounded item data inside one frame. `useEntryReveal`
keys frame entry to its mount and slot entry to item IDs. Its mount-scoped state
consumes an entry when motion is disabled, so turning motion on later does not
replay it. Perimeter traces and angular frame assembly are CSS-animated and
pause for reduced motion, disabled motion, inert or hidden decks, and the
shell's visibility-aware `data-ambient` boundary. Neither effect moves
navigation targets.

Validation: `npm run lint`, `npm run verify` (Node tests + build + token checks),
and UI checks using the Cloudflare development Worker on port 8787. Node tests
cover navigation wraparound, frame integrity/immutability, contribution dates,
validation parity, cache TTL/deduplication/recovery, and HTTP/Worker contracts.
