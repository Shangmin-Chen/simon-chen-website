# Simon Chen Website — design system conventions

An **editorial, warm-paper aesthetic**: square corners (`border-radius: 0`),
hairline borders, a Fraunces serif for display/body and JetBrains Mono for
code. Light theme is the default; a dark theme is available.

## Setup — wrap the tree in ThemeProvider

Every screen must be wrapped in `ThemeProvider`:

```jsx
const { ThemeProvider, Button, Card, Tag } = window.SimonChenWebsite;

<ThemeProvider>
  <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
    {/* ... */}
  </main>
</ThemeProvider>
```

- `ThemeProvider` toggles a `light` / `dark` class on `<html>` and is what
  `RatingGraph` reads via context — **`RatingGraph` throws without it.** The
  other components render styled even unwrapped (tokens are defined on `:root`),
  but always wrap so theming and chart components work.
- The library does **not** paint a page background; set
  `background: var(--bg-primary)` and `color: var(--text-primary)` on your root.

## Styling idiom — variant props + CSS custom properties

This is a **class-based** system, but you rarely write class names. Each
component takes a `variant` prop that selects its look; for your own layout
glue, style with the design tokens (`var(--*)`), never hard-coded colors.

Component variants (use these exact strings):

- **Button** — `variant`: `primary` (dark fill) · `secondary` (outline) ·
  `submit` (full-width). Also `disabled`, `type`, `onClick`, `className`.
- **Card** — thin container; `variant`: `default` · `blog` · `submission` ·
  `contest` · `experience`. The visible style is a bottom rule (or left rule for
  `experience`); put editorial markup inside.
- **Tag** — `variant`: `default` · `skill` · `tech` · `rating` · `verdict`.
  `rating`/`verdict` accept a `color` prop (drives a `currentColor` border).
- **FormField** — labeled `input` or `textarea` (`type="textarea"`); props
  `label`, `name`, `value`, `onChange`, `type`, `placeholder`, `required`,
  `rows`. Underline inputs, no boxes.
- **RatingGraph** — recharts line chart; `contests`: array of
  `{ ratingUpdateTimeSeconds, newRating, contestName, contestId }`.

## Design tokens (CSS custom properties)

Use these for all surfaces, text, borders, and type — they re-theme for dark
mode automatically:

- Surfaces: `--bg-primary` `--bg-secondary` `--bg-tertiary` `--card-bg`
  `--code-bg` `--hover-bg` `--stripe-bg`
- Text: `--text-primary` `--text-secondary` `--text-muted` `--text-tertiary`
- Lines: `--border-color` `--border-light`
- Accent / status: `--accent-color` `--accent-bg` `--success-color`
  `--error-color`
- Type: `--font-serif` (Fraunces) · `--font-mono` (JetBrains Mono)

## Where the truth lives

- `styles.css` (it `@import`s `_ds_bundle.css`) — the full token + component
  stylesheet. Read it before styling.
- Each component's `<Name>.prompt.md` and `<Name>.d.ts` — props and usage.

## Idiomatic example

```jsx
const { ThemeProvider, Card, Tag, Button } = window.SimonChenWebsite;

<ThemeProvider>
  <section style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    fontFamily: 'var(--font-serif)', padding: '3rem', display: 'grid', gap: '2rem' }}>
    <Card variant="blog">
      <h3 className="blog-title">Building Spark Bytes</h3>
      <p className="blog-excerpt" style={{ color: 'var(--text-secondary)' }}>
        A campus food-sharing app that cut event waste.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Tag variant="tech">React</Tag>
        <Tag variant="tech">Node.js</Tag>
      </div>
    </Card>
    <Button variant="primary" onClick={() => {}}>Read more</Button>
  </section>
</ThemeProvider>
```
