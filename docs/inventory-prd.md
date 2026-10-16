# Game Inventory UI and UX Product Requirements

**Status:** Approved and implemented; responsive QA in progress  
**Date:** 2026-10-15

## Problem and intended outcomes

The portfolio’s collections should feel like one coherent game menu: recognize a section, choose an item, open it, and return to the same place. Tile dimensions changed before that hierarchy was settled. A responsive grid and animated border alone do not make a useful inventory. The design must make real work and interests identifiable and navigation predictable.

The users are portfolio visitors on desktop or phone, plus keyboard and assistive-technology users who need the same content and actions. A newcomer should identify a collection and open an intended project, role, photo, hobby, or letter without learning a bespoke control scheme. Preserve the ASCII netrunner identity while making items easier to recognize.

## Product context and constraints

The shell has a fixed document at ordinary sizes, an approved ASCII intro, character portrait and crew wheel, and text/photo readers. Current data: Whoami has two experience roles and live GitHub activity; Projects has two items; Pictures has 18 photos in one album; Hobbies includes reading, chess, gaming, and running; Contact has one letter. More albums may be added. Live GitHub/Goodreads and the current contact draft/send flow remain.

The inventory owns the full browse area without a large selected-item preview or intermediate action. A slot opens the existing text inspector, photo viewer, or letter composer directly. Keep the character scene stable during inspection. Real compressed photos may be thumbnails. Use ASCII assets and code-driven textures; do not add generated images or 3D, fake gameplay, or another site’s layout as a template.

## Confirmed requirements

The inventory uses the full browse area for a responsive grid of real items, without a large selected-item preview or intermediate action. Larger slots, direct activation, native internal scrolling, the approved ASCII intro and character wheel, live GitHub/Goodreads, existing readers and letter drafts, reduced-motion support, and a fixed document at ordinary sizes are requirements. Character geometry stays stable during inspection. The desktop character scene uses about 36–38% of usable workspace, with a 270–300px ASCII portrait and a 210–230px radial crew wheel. Phones use a compact 160–180px context band with a 90–100px portrait and a 116–128px wheel. At 480–650px wide, the context band grows to about 200px with a larger portrait and 156px wheel. At 320px the name and role wrap under the portrait within their own column. Short viewports compact the context and retain native internal scrolling; dossier tracks grow to their readable content height inside the inventory scroll region.

## Goals and non-goals

Present real items clearly and support direct opening and reliable return by pointer, touch, or keyboard. Preserve the approved portrait, wheel, dark token palette, restrained ambient frame motion, gallery, live integrations, and letter drafts.

It will not add fake rarity, locked slots, capacity meters, invented stats, autoplay, a minigame, Codeforces, decorative generated art, hover glitches, or a second copy of reader/lightbox content. Gamepad support is a possible future enhancement, not a current claim.

## Information hierarchy and item content

The scene establishes the character and current section. The collection heading/count then identify the browse context. Each slot presents a recognizable item and, where useful, a short real-content cue. Hints are secondary; essential labels must not be clipped or reduced to tiny metadata. Tile treatment can adapt to item type rather than forcing one thumbnail-and-caption template on all content.

| Collection | Slot content | Open behavior |
| --- | --- | --- |
| Whoami experience | Role title, organization, and truthful brief detail/date when available; keep the short bio visible | Opens role text; bio remains in section context |
| GitHub activity | Recognizable `github-activity.log` item with live-feed state and real activity/date cues | Opens the contribution graph in its reader |
| Projects | Recognizable title and one-line purpose; actual file cue/status may be secondary | Opens full project description in reader |
| Pictures | Meaningful contained thumbnail and short identifier | Opens photo directly; full caption/location belong in viewer |
| Hobbies | Clear activity title; reading may use actual Goodreads data | Opens existing description or live reading information |
| Contact | ASCII envelope/letter and truthful state such as Ready to write, Draft in progress, Sending, or Sent | Opens existing validated letter composer |

Do not repeat the same index/count on every tile or invent unavailable status. Sent appears only after send succeeds; errors retain the draft. Thumbnails preserve aspect ratio and reserve geometry through loading and failure.

## Responsive grid and geometry

Measure usable grid width and height after frame padding and scrollbar. One shared presentation policy chooses columns and visible rows; keyboard spatial navigation uses that same column count after resize, while DOM order and activation targets stay stable. Photo grids use two columns when each slot retains comfortable width, otherwise one. Project dossiers remain stacked.

Photo slots distinguish subjects with contained thumbnails and brief captions; dossier and text slots keep essential copy readable. The two project dossiers stack and share the browse area. Sparse collections retain comfortable bounded items and intentional whitespace. Do not add dummy items.

At normal sizes, the document stays fixed and one vertical inventory region scrolls internally. Use native wheel/touch scrolling; no pagination, horizontal scrolling, or scroll-jacking. Scrolling under a stationary pointer cannot change the retained item. Short or zoomed views compact the character context and frame chrome while retaining a readable internal scroll region.

## Requirements and acceptance

| ID | Priority | Acceptance |
| --- | --- | --- |
| INV-01 | Must | Heading/count and item identity are visible; tile anatomy suits photos, text, roles, hobbies, and the letter. |
| INV-02 | Must | Responsive grid uses usable bounds; after resize, spatial arrows match displayed columns without reordering items. |
| INV-03 | Must | Hover is transient. One click/tap opens directly; scrolling cannot activate a slot or change retained selection. |
| INV-04 | Must | Native slot buttons use Enter/Space; arrows navigate spatially with predictable incomplete-row edges, Home/End reach bounds, Tab order is predictable, focus is visible on every tile. |
| INV-05 | Must | Escape and visible Back/Close close one level. Return restores item, scroll, and focus; previous/next makes the last viewed photo the return target. |
| INV-06 | Must | Text reader scrolls naturally without forced focus trap; modal photo viewer contains/restores focus. Actual caption names photo; nested thumbnail alt is empty to avoid duplicate announcement. |
| INV-07 | Must | Loading, empty, failure, and contact states differ. Failed images retain geometry; send errors retain draft and pending sends cannot duplicate. |
| INV-08 | Must | Motion-off/reduced motion/hidden/inert states stop effects; content and controls remain immediately available. |

Selected/return target changes only through intentional focus, activation, or item navigation, never hover or stationary-pointer scroll. Focused, retained, opened, disabled, and loading states cannot rely on color alone. Xbox guidance recommends predictable navigation that reflects layout, consistent input behavior, and a reliable way back ([XAG 112](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/112)).

## Motion and visual language

Keep the ASCII-forward, dark, angular language and semantic token palette. The character and wheel remain the primary scene. Bounded idle frame motion and item-entry construction may add energy without overpowering content or shifting hit targets. Do not glitch items on hover or continuously scramble essential labels; ambient effects cannot wash out text or photos. A brief title/caption decode on opening may use the shared signal cadence only while original semantic text remains immediately available. Preserve approved intro and portrait glitch behavior.

Selection, opening, closing, and return should make state changes clear. A short directional reveal may connect an activated slot to its reader, viewer, or composer, while content and controls remain immediately available. Effects stop or stay static when motion is disabled, reduced motion is requested, the document is hidden, or the view is inert. Animation never gates input.

Prototype timing targets are 100–180 ms for hover/focus and 200–350 ms for opening/closing. These are tuning proposals, not approved values or accessibility standards.

## Accessibility and performance

Every slot is a native button with a useful name. A photo’s accessible name comes from its actual caption; a nested thumbnail has empty alt text to prevent duplicate announcement. Decorative ASCII is hidden when the title already names the item. Focus stays visible over photo and text tiles. Proposed tuning targets are 14–16 CSS px for essential labels and 44×44 CSS px for touch targets. 44×44 is a product target, not the WCAG 2.2 AA minimum: criterion 2.5.8 specifies 24×24 CSS px subject to spacing and other exceptions ([Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).

Check contrast for text, boundaries, focus, and states against every tile treatment. Keep all actions operable by keyboard/touch and support reduced motion. Xbox guidance covers visible focus on varied backgrounds and focus scope in modal experiences ([XAG 113](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/113)). Do not force a focus trap for nonmodal readers.

Load compressed thumbnails lazily and request full photos only after opening. Keep aspect ratios stable and failure geometry intact. Animation must not rerender the whole shell each frame. Keep slot summaries brief with a clear path to deeper content, consistent with progressive disclosure guidance ([NNGroup](https://www.nngroup.com/articles/progressive-disclosure/)).

## Acceptance and review

Review 0, 1, 2, 3, 5, 18, and 50 items; long names; portrait, landscape, and square photos; and broken thumbnails. Check 320×568, 390×844, 625×984, 1280×720, 1440×900, short landscape, and browser zoom.

Functional checks cover a newcomer identifying section/action, opening the intended item once, restoring correct item/focus/scroll, browsing to the last photo and returning there, reading/back from a project, retaining a partial letter, spatial navigation after resize, and native internal scrolling. These checks are separate from design approval.

Visual review checks that three photo subjects are recognizable in the grid, sparse and dense collections feel composed, essential content is salient, and mobile remains readable and operable. Reviewers should identify character and section context, then item content and primary action in that order. Focus, open, close, and return should share a geometric and motion language with the crew selector; the selected item and next action should remain unambiguous at rest and through transitions. The approved composition is the implementation baseline; screenshot bounds, builds and unit tests validate behavior and layout at the requested sizes. Formative review with representative visitors can surface confusion and guide later refinement.

## Approved design decisions

1. **Low-count collections:** Use bounded tiles with intentional whitespace. The two project dossiers share the remaining browse area as stacked cards, while sparse role, hobby and letter inventories keep comfortable item sizes.
2. **Short viewport and zoom:** Compact the character context and frame chrome while retaining a readable native internal scroll region. Keep the shell fixed at ordinary viewport sizes.
3. **Content-specific anatomy:** Use contained real thumbnails with brief photo identifiers; two typographic project dossiers with a title, one-line purpose, actual detail, technology cues and metadata; concise role/activity cards; and the existing ASCII letter slot. These types share the measured inventory frame and direct-opening behavior.

The approved layout is implemented with the existing live data, portrait assets, navigation and readers. Validation covers sparse, typical, dense, narrow-phone and short-landscape bounds, including the 320×568 and 844×390 cases. Future composition changes should preserve this hierarchy and real-content behavior.

## Current section-selector behavior (2026-10-15)

The current selector supersedes the earlier wheel-size measurements and
Previous/Next controls described above. It is an endless carousel: five unique
section destinations circulate around an elliptical arc, the selected one
settles at center/front, and the outer card fades before re-entering from the
opposite side. Pointer selection, multi-step drag, accumulated wheel input, and
focused-button looping Left/Right or Home/End navigation remain available.
Other inventory and composition requirements above remain in effect.
