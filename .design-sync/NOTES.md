# design-sync notes — simon-chen-website

Repo-specific gotchas for syncing this design system to claude.ai/design.
Project: **Simon Chen Website DS** (`1946e533-a140-4dd6-8579-51826a9a102c`).

## Shape & scope
- This is a **Vite app, not a published component library** — no `dist`, no
  `module`/`main`/`exports`, no types. Runs in the converter's **synth-entry**
  territory, but with a hand-written entry (below).
- Synced scope is intentionally just **5 UI components**: `Button`, `Card`,
  `Tag`, `FormField` (group `general`) and `RatingGraph` (group `charts`). The
  app has many more components (Hero, Navbar, About, …) deliberately left out —
  they're app-specific compositions, not reusable DS parts. To add one, extend
  `cfg.componentSrcMap` and re-export it from `.design-sync/entry.jsx`.

## Custom barrel entry (load-bearing)
- The components use `export default`, which `export *` (the synth-entry
  default) does **not** re-export — so the auto entry would discover them but
  leave `window.SimonChenWebsite.<Name>` undefined. `.design-sync/entry.jsx`
  re-exports each default as a **named** export, plus `ThemeProvider`. Pinned
  via `cfg.entry`. Discovery is driven by `cfg.componentSrcMap` (the .d.ts scan
  finds nothing). If you add a component, do BOTH.

## CSS (must be flattened)
- `src/styles/index.css` is a tree of relative `@import`s; the converter copies
  `cfg.cssEntry` verbatim to the bundle root, where those relatives would
  dangle. `cfg.buildCmd` = `node .design-sync/build-css.mjs` esbuild-bundles it
  into `.design-sync/styles.bundled.css` (gitignored) with global class names
  intact. **The driver runs `cfg.buildCmd` before the converter** — if you ever
  run `package-build.mjs` directly, run build-css.mjs first.
- Tokens live in `:root` (light theme is the default), so components render
  styled even without a theme class. `_ds_bundle.css` carries everything;
  `tokens/` and `fonts/` are empty by design.

## Fonts
- Brand fonts **Fraunces** + **JetBrains Mono** load from **Google Fonts** at
  runtime — the app links them in `index.html`, not via CSS. `build-css.mjs`
  prepends a `@import url(fonts.googleapis…)` so the styles closure loads them.
  Validate prints `[FONT_REMOTE]` (expected) — NOT `[FONT_MISSING]`.

## Provider
- `cfg.provider = ThemeProvider`. `RatingGraph` reads `useTheme()` and **throws
  without it**; the other four don't need it but are wrapped harmlessly.

## Previews
- `RatingGraph.tsx` overrides `requestAnimationFrame` so recharts' line
  animation settles to its final frame under the capture harness's frozen
  clock (verified: the live card animates fine in a real browser without it).
- `dtsPropsFor` is hand-written for all 5 (synth mode has no types).
- `cfg.guidelinesGlob = []` — the repo's `docs/*.md` are developer docs
  (architecture, API notes, old README), not design guidance; excluded.

## Known render warns (recorded — not new)
- `[FONT_REMOTE]` "Fraunces", "JetBrains Mono" — remote font host, expected.

## Re-sync risks (watch-list)
- **`dtsPropsFor` can drift**: it's hand-maintained. If a component's props
  change in `src/`, the synced `.d.ts` won't follow automatically — update
  `cfg.dtsPropsFor`.
- **`conventions.md` names are tied to source**: the enumerated tokens come
  from `src/styles/base/variables.css` and the variant strings from each
  component's `variant` map. If those change, re-validate the header (the
  conventions step does this automatically and reports drift).
- **`RatingGraph.tsx` inlines sample `contests` data** — purely illustrative;
  no upstream link to keep in sync.
- **Build assumes network**: `build-css.mjs` prepends a remote Google Fonts
  `@import`; fonts only resolve when the consuming environment has network.
- Toolchain: built with Node + the repo's esbuild (0.28.1 override), playwright
  chromium v1228.
