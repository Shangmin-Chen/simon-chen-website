# Portfolio components

- `Portfolio`: URL-to-character mapping, shell, intro lifecycle, motion controls.
- `NameCycle`: terminal-style multilingual display name; one accessible static
  label and locally timed grapheme typing when motion is enabled.
- `AsciiPortrait`: colored text runs, local gaze/blink timer and shared domain
  glitch plan, frame border.
  Eye gaze follows the pointer horizontally; CSS tracer rays originate at each
  source iris center and are suppressed for frames without eye data.
- `CrewWheel`: native selection controls and scoped drag/scroll/keyboard
  gestures. Its local selection frame pauses for the intro, hidden tabs,
  reduced motion, or the saved motion toggle; interactive targets stay fixed.
- `ContentPanel`: stable character scene, per-section selected card state, and
  mounted Contact/Pictures sections.
- `InspectPanel`: in-scene text inspection over the card area; the underlying
  scene stays dimmed and inert while the card selection is retained. Opening
  uses a short masked panel/frame reveal on a real open transition when motion
  is enabled; focus and content are available immediately, and changing motion
  preferences never replays an already-open panel.
- `ReaderFrame`: shared breadcrumb, title, Back, scrollable text body, and footer
  navigation for focused text inspections.
- `SequenceNavigation`: native previous/next controls and an item count for
  multi-entry text file sequences.
- `CardDeck` / `InventoryFrame` / `InventorySlot` / `InventoryPreview`: a game
  inventory in one perimeter frame, with a measured one-column item rack and
  prominent selected-item stage. Rows fill available rack height while all
  items fit; longer lists use an internally scrollable rack. Wide layouts place
  the rack beside the stage; measured narrow layouts place the stage above the
  rack, while very short layouts omit the stage and keep direct slot opening.
  Preview text and artwork come from real item data, with a native open action.
  Hover, focus, and selection update the preview and active bracket without moving
  slots; click or Enter opens the item directly. Arrows, Home, and End traverse
  the full list and keep the focused item in view; native wheel and touch
  scrolling remain available. Returning focus or mounting a section scrolls
  the selected item into view without taking focus. A restrained perimeter
  trace and angular frame assembly animate without moving targets. The shared
  `useEntryReveal` hook keys the frame to its mount, slots to item IDs, and the
  preview to its persistent mount, so changing selection does not replay the
  preview reveal. Motion-off consumes an entry; enabling motion later does not
  replay it. Traces pause for hidden tabs, inert decks, disabled motion, or
  reduced motion.
- `SignalBands` / `DecodePhrase`: a short Unicode-safe title/caption reveal
  with horizontal signal bands; original text stays semantic and readable to
  assistive technology, and motion follows the shell preference.
- `Intro`: approved ASCII emblem with the shared domain glitch plan, automatic
  entry, focus and skip behavior.
- `File`: terminal-style file content inside the shared text reader.
- `ResourceState`: loading, failure/retry, and empty-state presentation.
- Section views: real whoami/GitHub activity, projects, photo galleries, hobbies/
  Goodreads, and contact. These receive ports and do not call fetch directly.
  ContentPanel retains the selected card ID for each text section. It renders
  card and inspection bodies for the active section, keeps Contact mounted
  while hidden to preserve letter drafts/validation, and keeps Pictures
  mounted to preserve per-album photo selection. Contact is a one-item comms
  inventory: opening its ASCII letter slot shows an in-scene `LetterComposer`
  with the existing validated send action and social links. Closing the letter
  keeps the draft and returns focus to the selected slot. Gallery cards use R2
  thumbnails and open the selected full image directly in `Lightbox`.
- `Lightbox`: existing gallery viewer, retained for swipe and pinch zoom, with
  a bounded caption reveal that stops when motion is disabled or the viewer closes.

New views should consume structured `src/data` content or a supplied resource
port. Keep network calls in adapters and algorithms in domain modules. Keep
DOM effects local with cleanup; never drive the whole shell from animation ticks.
Glitch cadence and band translation live in the pure domain layer; UI components
own timers and reduced-motion adaptation.
