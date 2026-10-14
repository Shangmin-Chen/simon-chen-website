# Portfolio components

- `Portfolio`: URL-to-character mapping, shell, intro lifecycle, motion controls.
- `AsciiPortrait`: colored text runs, local gaze/blink timer and shared domain
  glitch plan, frame border.
  Eye gaze follows the pointer horizontally; CSS tracer rays start at each source
  iris center and stay off for frames without eye data.
- `CrewWheel`: native selection controls and scoped drag/scroll/keyboard gestures.
- `ContentPanel`: accessible owner identity and stable section paging window.
- `Intro`: approved ASCII emblem with the shared domain glitch plan, automatic
  entry, focus and skip behavior.
- `File`: native expandable text files; expansion survives section changes.
- `ResourceState`: loading, failure/retry, and empty-state presentation.
- Section views: real whoami/GitHub activity, projects, albums/photos, hobbies/
  Goodreads, and contact. These receive ports and do not call fetch directly.
- `Lightbox`: existing gallery viewer, retained for swipe and pinch zoom.

New views should consume structured `src/data` content or a supplied resource
port. Keep network calls in adapters and algorithms in domain modules. Keep
DOM effects local with cleanup; never drive the whole shell from animation ticks.
Glitch cadence and band translation live in the pure domain layer; UI components
own timers and reduced-motion adaptation.
