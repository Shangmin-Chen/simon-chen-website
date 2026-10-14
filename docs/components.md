# Portfolio components

- `Portfolio`: URL-to-character mapping, shell, intro lifecycle, motion controls.
- `AsciiPortrait`: colored text runs, local gaze/blink/glitch timer, frame border.
- `CrewWheel`: native selection controls and scoped drag/scroll/keyboard gestures.
- `ContentPanel`: stable name and independently scrolling section buffer.
- `Intro`: approved ASCII emblem, automatic entry, focus and skip behavior.
- `File`: native expandable text files; expansion survives section changes.
- `ResourceState`: loading, failure/retry, and empty-state presentation.
- Section views: real whoami/experience, projects/GitHub, albums/photos, hobbies/
  Goodreads, and contact. These receive ports and do not call fetch directly.
- `Lightbox`: existing gallery viewer, retained for swipe and pinch zoom.

New views should consume structured `src/data` content or a supplied resource
port. Keep network calls in adapters and algorithms in domain modules. Keep
DOM effects local with cleanup; never drive the whole shell from animation ticks.
