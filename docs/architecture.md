# Website Architecture & Technical Reference

This document outlines the current technical architecture, data flow, features, and optimizations implemented on the portfolio website.

---

## 🏗️ Folder Structure & Component Layout

```text
simon-chen-website/
├── docs/                 # Documentation (Codeforces API, architecture overview)
├── src/
│   ├── App.jsx           # Main routing (React Router) & global hook bindings
│   ├── components/       # UI elements and section layouts (About, Experience, etc.)
│   │   ├── ui/           # Reusable atomic design components (Button, Tag, FormField)
│   │   └── mdx/          # MDX components and configurations
│   ├── content/          # Rich text markdown-based posts
│   │   └── posts/        # MDX post files
│   ├── data/             # Static configurations & mock/portfolio metadata
│   ├── hooks/            # Reusable React hooks (useGallery, useScrollReveal)
│   ├── styles/           # Modular CSS structure (base resets, layout grids, components)
│   ├── utils/            # Shared helper scripts (scroll, email services)
│   └── worker.js         # Cloudflare Worker script for API proxies & form handlers
└── wrangler.jsonc        # Cloudflare configuration file
```

---

## 🔄 Data Flow & Backend Integrations

The website runs fully serverless using **Cloudflare Workers**. 

The front-end does not make requests directly to third-party endpoints to avoid CORS limits and preserve API credentials. Instead, requests are proxied via `src/worker.js`:

1. **GitHub Contributions Grid:** `GET /api/github-contributions` fetches, parses, and edge-caches contribution maps.
2. **Goodreads Currently Reading Shelf:** `GET /api/goodreads` fetches RSS XML from Goodreads, parses it into light JSON, and edge-caches results.
3. **Photo Gallery Manifest:** `GET /api/gallery` proxies `gallery.json` hosted on a secure Cloudflare R2 bucket (`https://images.simon-chen.com`) with a 300-second Edge CDN TTL.
4. **Contact Form Submissions:** `POST /api/contact` accepts name, email, subject, and message, validates the content, and calls the private EmailJS API using Cloudflare Environment secrets.

---

## 🎨 Interactive Features & Recent Optimizations

### 1. Hero Polaroid Picture Frame
- restyled `Hero.jsx` using `hero-avatar.css` to feature an elegant polaroid-style image box containing the profile photo (`shanghai_08-full.jpg` from the R2 domain).
- Built with a subtle rotation (`rotate(2deg)`) that straightens and scales gently on hover (`rotate(0deg) scale(1.03)`) for a premium tactile feel.
- The photo caption is an active route link (`/gallery/shanghai-study-abroad`) resolving directly to the gallery page.

### 2. Smooth Scrolling & Navigation Fixes
- Section navigation is managed via `src/utils/scrollUtils.js` which performs smooth browser window scrolling with offsets to account for the fixed header height.
- **Mobile Menu Fix:** Solved a critical issue where mobile navigation links failed to scroll because the body scroll lock (`overflow: hidden`) remained active during the scroll request. The drawer menu now toggles `isMenuOpen` to `false` and schedules the scroll action (using `300ms` on the home page and `350ms` when navigating) to allow the drawer's `280ms` close transition to finish and WebKit/Safari to fully release the body scroll lock. Additionally, resolved a z-index stacking context bug where `.nav-backdrop` (z-index 998) was stacking *above* `.navbar` (previously z-index auto) and intercepting all mobile link tap gestures (closing the menu but failing to fire the link `onClick` handlers). Giving `.navbar` `z-index: 1000` guarantees links sit on top and receive click events.

### 3. Route Chunk Loading Optimization (Eager Loading)
- Changed routing from lazy loading (`React.lazy`) to static imports for `GalleryPage`.
- **Why:** Navigating to lazy routes caused layout suspension while downloading separate JS chunks. Because dynamically mounted images initially render in zero-height containers before styles settle, the browser's intersection engine incorrectly deferred loading `loading="lazy"` images. By importing the route statically and switching images to `loading="eager"`, pages mount immediately, and all assets load simultaneously.

---

## 🛡️ Security & Dependency Alignments

- **Transitive Vulnerability Mitigation:** Patched **GHSA-g7r4-m6w7-qqqr** (arbitrary file read/directory traversal on Windows) in `esbuild`. 
- Since `vite` depends on `esbuild` versions that resolved to vulnerable packages (like `0.27.3`), we specified a dependency override (`"overrides": { "esbuild": "0.28.1" }`) in `package.json` to force npm to resolve the patched, secure version.
