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

The styling architecture in [`src/styles/base/variables.css`](src/styles/base/variables.css) follows a strict **3-Layer Design Token Architecture**, maintaining color consistency through raw channels, semantic colors, and component tokens without hardcoded hex colors.

```text
Layer 1: --color-bg-primary-hsl: 258 24% 5%
                  ↓
Layer 2: --bg-primary: hsl(var(--color-bg-primary-hsl))
                  ↓
Layer 3: --wheel-rail: var(--border-color)
```

### Layer 1: Primitives (HSL Channel Triplets)
Raw color channels defined without `hsl()` wrappers to allow dynamic alpha compositing:
- **Portfolio palette**: `--color-bg-primary-hsl: 258 24% 5%`, `--color-text-primary-hsl: 62 16% 87%`, `--color-accent-hsl: 68 100% 63%`.
- The ASCII portfolio uses one dark palette; motion preferences are independent of color.
- Frame-specific sampled palettes are bound at the portrait UI boundary as `--portrait-*` variables.

### Layer 2: Semantic Tokens

Use `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-muted`,
`--border-color`, `--accent-color`, `--link-color`, and `--highlight-color`.
Alpha surfaces derive from the raw channels, e.g. `--texture-color`.

### Layer 3: Component Tokens

Components consume `--portrait-frame`, `--portrait-title`, `--wheel-rail`,
`--activity-empty`, `--activity-low`, and `--activity-high`. Portrait colors
bind sampled HSL data to component-scoped `--portrait-*` variables.

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
| `npm run verify` | Runs domain/adapter/Worker tests, production build, and token checks for complete build and token verification. |
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

## 6. Portfolio boundaries

`src/portfolio/domain` is pure JavaScript, independent of React, HTTP, storage,
and routing. `application` holds use cases and resource subscriptions, accepting
ports. `adapters` implements HTTP, cache, and browser storage. `ui` owns React,
DOM effects, accessibility, and routing. `src/App.jsx` composes these layers.
See `docs/architecture.md` for dependency rules and tests.
