# Portfolio components

- `Portfolio`: URL-to-character mapping, shell, intro lifecycle, motion controls.
- `NameCycle`: terminal-style multilingual display name; one accessible static
  label and locally timed grapheme typing when motion is enabled.
- `AsciiPortrait`: colored text runs, local gaze/blink timer and shared domain
  glitch plan, frame border.
  Eye gaze follows the pointer horizontally; CSS tracer rays originate at each
  source iris center and are suppressed for frames without eye data.
- `CrewWheel`: native selection controls and scoped drag/scroll/keyboard gestures.
- `ContentPanel`: compact section file indexes and route-aware reader state.
- `ReaderFrame`: shared breadcrumb, title, Back, scrollable-text or bounded-media
  body, and footer navigation for focused readers.
- `SequenceNavigation`: native previous/next controls and an item count for
  multi-entry file sequences, albums, and photo sets.
- `MediaStage`: source-agnostic image stage that measures available space and
  natural dimensions, then asks pure orientation helpers for ratio-preserving
  contain sizing.
- `Intro`: approved ASCII emblem with the shared domain glitch plan, automatic
  entry, focus and skip behavior.
- `File`: terminal-style file content inside the shared text reader.
- `ResourceState`: loading, failure/retry, and empty-state presentation.
- Section views: real whoami/GitHub activity, projects, albums/photos, hobbies/
  Goodreads, and contact. These receive ports and do not call fetch directly.
  ContentPanel retains per-section selected and opener IDs. It renders text
  bodies for the active section, keeps the Contact frame mounted while hidden
  to preserve drafts/validation, and keeps the Pictures container mounted to
  preserve per-album selection.
- `Lightbox`: existing gallery viewer, retained for swipe and pinch zoom.

New views should consume structured `src/data` content or a supplied resource
port. Keep network calls in adapters and algorithms in domain modules. Keep
DOM effects local with cleanup; never drive the whole shell from animation ticks.
Glitch cadence and band translation live in the pure domain layer; UI components
own timers and reduced-motion adaptation.
