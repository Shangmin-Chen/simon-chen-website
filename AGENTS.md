# AGENTS.md — Development & Architectural Reference Guide

Welcome to the **Simon Chen Portfolio Website** codebase (`simon-chen-website`). This guide serves as an authoritative reference for developers and automated AI agents interacting with, contributing to, or refactoring this project.

---

## 1. Technical Overview

The application is a high-performance personal portfolio, gallery, and data dashboard built with a modern serverless stack:

- **Frontend Core**: [React 19](https://react.dev/) paired with [Vite](https://vitejs.dev/) for lightning-fast module bundling and Hot Module Replacement (HMR).
- **Routing**: [React Router v8](https://reactrouter.com/) using eager component loading (`import`) for critical views to avoid dynamic code-splitting suspensions.
- **Backend & Proxying**: Single-page application hosted on **Cloudflare Workers** (`src/worker.js` / `wrangler.jsonc`), which proxies all API endpoints under `/api/*` to bypass browser CORS limitations, sanitize requests, and edge-cache third-party responses. Local development is run exclusively via the Cloudflare Dev Worker (`npx wrangler dev` / `npm run dev:worker` on port 8787), which serves both static SPA assets and local API proxies (`/api/*`).
- **Media Asset Storage**: Dynamic photo assets hosted on a high-throughput Cloudflare R2 bucket (`https://images.simon-chen.com`) with automated image processing and Blurhash generation.

---

## 2. 3-Layer Design Token System

The styling architecture in [`src/styles/base/variables.css`](src/styles/base/variables.css) follows a strict **3-Layer Design Token Architecture**, enabling smooth theme switching (light/dark mode) and maintaining color consistency without hardcoded hex colors.

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Primitives (HSL Raw Channel Triplets)           │
│ e.g., --color-bg-primary-hsl: 38 33% 94%                │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Semantic Tokens & Glassmorphism Variables      │
│ e.g., --bg-primary: hsl(var(--color-bg-primary-hsl))    │
│ e.g., --glass-bg: hsl(var(--color-bg-primary-hsl) / 0.75)│
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Component & Recharts Tokens                    │
│ e.g., --chart-stroke: var(--accent-color)               │
│ e.g., --chart-tooltip-bg: var(--glass-bg)               │
└───────────────────────────┴─────────────────────────────┘
```

### Layer 1: Primitives (HSL Channel Triplets)
Raw color channels defined without `hsl()` wrappers to allow dynamic alpha compositing:
- **Light Theme**: `--color-bg-primary-hsl: 38 33% 94%`, `--color-text-primary-hsl: 0 0% 10%`, `--color-accent-hsl: 11 68% 44%`.
- **Dark Theme** (`:root.dark`): `--color-bg-primary-hsl: 48 8% 12%`, `--color-text-primary-hsl: 42 40% 88%`, `--color-accent-hsl: 13 76% 62%`.

### Layer 2: Semantic Tokens & Glassmorphism
High-level tokens representing layout intent, using channel triplets:
- **Colors**: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-color`, `--accent-color`.
- **Alpha Compositing**: `--hover-bg: hsl(var(--color-text-primary-hsl) / 0.06)`, `--navbar-bg: hsl(var(--color-bg-primary-hsl) / 0.88)`.
- **Glassmorphism Variables**:
  - `--glass-bg`: `hsl(var(--color-bg-primary-hsl) / 0.75)`
  - `--glass-border`: `hsl(var(--color-border-hsl) / 0.5)`
  - `--glass-blur`: `12px`
  - `--glass-shadow`: `0 8px 32px 0 rgba(0, 0, 0, 0.08)`
  - Class `.glass-card` uses `backdrop-filter: blur(var(--glass-blur))` with standard `@supports not (backdrop-filter: ...)` fallbacks.

### Layer 3: Component & Charting Tokens
Specific tokens consumed directly by visualization libraries ([Recharts](https://recharts.org/)) and complex UI components:
- `--chart-stroke`: `var(--accent-color)`
- `--chart-fill-top`: `hsl(var(--color-accent-hsl) / 0.25)`
- `--chart-fill-bottom`: `hsl(var(--color-accent-hsl) / 0.02)`
- `--chart-grid-stroke`: `var(--border-light)`
- `--chart-axis-text`: `var(--text-secondary)`
- `--chart-tooltip-bg`: `var(--glass-bg)`
- `--chart-tooltip-border`: `var(--glass-border)`
- `--chart-tooltip-text`: `var(--text-primary)`

---

## 3. Serverless API Workflow

All network requests originating from the client target local relative routes (`/api/*`), handled directly by the Cloudflare Worker script in [`src/worker.js`](src/worker.js).

| Route | HTTP Method | Upstream Endpoint / Target | Cache Policy / Behavior |
| :--- | :--- | :--- | :--- |
| `/api/github-contributions` | `GET` | `https://github-contributions-api.jogruber.de/v4/Shangmin-Chen?y=last` | Edge-cached for **3600 seconds** (`max-age=3600`). Prevents API rate-limiting on upstream contribution graph service. |
| `/api/goodreads` | `GET` | `https://www.goodreads.com/review/list_rss/141302044?shelf=currently-reading` | Edge-cached for **3600 seconds**. Fetches RSS XML with custom browser `User-Agent`, parses items into JSON array (`title`, `author`, `cover`, `link`, `rating`). |
| `/api/gallery` | `GET` | `https://images.simon-chen.com/gallery.json` | Edge-cached for **300 seconds**. Fetches photo gallery metadata manifest from Cloudflare R2 bucket. Short TTL enables fast updates without site redeploy. |
| `/api/contact` | `POST` | `https://api.emailjs.com/api/v1.0/email/send` | Non-cached. Validates `name`, `email`, `subject`, and `message`. Injects Cloudflare secrets (`EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`) to transmit message safely. |

---

## 4. Standard CLI Commands

Use the following CLI commands during development, testing, asset generation, and deployment. Local development is run exclusively via the Cloudflare Dev Worker (`npx wrangler dev` / `npm run dev:worker` on port 8787):

| Command | Action / Description |
| :--- | :--- |
| `npm run dev:worker` | Builds static assets and launches `wrangler dev` server on port 8787 (exclusive local development mode, serving static SPA assets and `/api/*` proxies). |
| `npx wrangler dev` | Starts local Cloudflare Worker development environment on port 8787. |
| `npm run dev` | Launches standalone Vite local development server. |
| `npm run check:tokens` | Executes architecture sanity checks on CSS design tokens and component compliance. |
| `npm run verify` | Runs `npm run build && npm run check:tokens` for complete build and token verification. |
| `npm run build` | Compiles production assets into `./build` folder using Vite. |
| `npm run gallery:resize` | Executes [`scripts/resize-gallery.mjs`](scripts/resize-gallery.mjs) via Sharp to process images and generate Blurhash string placeholders for the gallery manifest. |
| `npm run deploy` | Runs production build and deploys worker and static assets to Cloudflare via `wrangler deploy`. |

---

## 5. Coding Guidelines & Conventions

### Modular CSS Structure
- Styles are divided modularly across `src/styles/` (`base/`, `components/`, `layouts/`, `utils/`).
- Never hardcode HEX or RGB values in component style files; always reference Layer 2 or Layer 3 design tokens (`var(--text-primary)`, `var(--bg-secondary)`).

### Accessible HTML5 Architecture
- Use semantic layout elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`).
- Ensure all interactive elements have visible focus states, correct ARIA attributes (`aria-expanded`, `aria-label`, `aria-hidden`), and image `alt` attributes.

### Production Integrity & Zero Dummy Placeholders
- Do not check in mock data or `Lorem Ipsum` placeholders in core UI components.
- Rely on structured data schemas in `src/data/` or API responses from `/api/*`.

### Cloudflare Deployment Protocol
- Ensure `wrangler.jsonc` matches Worker configurations.
- Client static SPA fallback is enforced via `not_found_handling: "single-page-application"`.
