# Simon Chen - Portfolio Website

A modern, responsive portfolio website built with React and Vite, featuring custom animations, dynamic API integrations (GitHub contributions, Goodreads bookshelf, Codeforces stats, photo gallery, and contact form), hosted and served on **Cloudflare Pages & Workers**.

## 🚀 Live Demo

Visit the live website: [https://simon-chen.com](https://simon-chen.com)

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0, JavaScript (ES6+), Vite
- **Styling**: CSS3 with custom animations and dynamic Light/Dark mode themes
- **APIs & Workers**: Cloudflare Worker (`src/worker.js`) proxying:
  - `GET /api/github-contributions` for contribution graphs
  - `GET /api/goodreads` for the currently reading list
  - `GET /api/gallery` for the photo gallery manifest
  - `POST /api/contact` for the EmailJS contact form integration
- **Hosting**: Cloudflare Pages & Workers (`wrangler.jsonc`)

## 💻 Local Development

Prerequisites: [Node.js](https://nodejs.org/) 20+ (recommended).

### 1. Clone and Install
```bash
git clone https://github.com/Shangmin-Chen/simon-chen-website.git
cd simon-chen-website
npm install
```

Local development is run exclusively via the Cloudflare Dev Worker (`npx wrangler dev` / `npm run dev:worker` on port 8787), which serves both static SPA assets and local API proxies (`/api/*`).

### 2. Run the Cloudflare Dev Worker
1. **Set Up Local Secrets**: Copy `.dev.vars.example` to `.dev.vars` and add your EmailJS API keys:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
2. **Start the Dev Worker**:
   ```bash
   npm run dev:worker
   ```
   *Alternatively, run `npx wrangler dev`.*
   
   The Cloudflare Dev Worker runs on `http://localhost:8787` (or `http://127.0.0.1:8787`), serving both static SPA frontend assets (`./build`) and local API proxy endpoints (`/api/*`).

## 📸 Image Gallery Optimization

The photo gallery is dynamically fed by `gallery.json` (hosted on Cloudflare R2) and loads assets hosted on Cloudflare R2. Before uploading raw images to R2, optimize them using the custom gallery resize script:

```bash
npm run gallery:resize -- <inputDir> <outputDir>
```
For example:
```bash
node scripts/resize-gallery.mjs ./my-raw-photos ./optimized-photos
```
This script uses [sharp](https://sharp.pixelplumbing.com/) to convert full-resolution images into optimized JPEG formats:
- `-full` images (max-width 1800px) for carousels and lightboxes.
- `-thumb` images (max-width 700px) for grid thumbnails.

After processing:
1. Reference the new/optimized image filenames in your local `gallery.json`.
2. Upload the optimized photos from `<outputDir>` to your Cloudflare R2 bucket.
3. Upload the updated `gallery.json` manifest to your Cloudflare R2 bucket.

Because the Cloudflare Worker proxies `gallery.json` directly from R2 (`/api/gallery`), uploading these assets to R2 will update the gallery on the live site instantly without requiring a redeployment of the website.

## 📧 EmailJS Setup

1. **Create an EmailJS Account** at [EmailJS](https://www.emailjs.com/) and set up an email service + template.
2. **Worker Environment Secrets**: Set `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, and `EMAILJS_PUBLIC_KEY` as secrets on your Cloudflare Worker:
   ```bash
   npx wrangler secret put EMAILJS_SERVICE_ID
   npx wrangler secret put EMAILJS_TEMPLATE_ID
   npx wrangler secret put EMAILJS_PUBLIC_KEY
   ```
   For local testing, add these variables to `.dev.vars` (see `.dev.vars.example`).
3. **Origin Allowlist**: In your EmailJS dashboard, restrict allowed origins to your domain(s) for security.

## 🔧 Configuration

- **Local Dev Server Port**: Local development is run exclusively via Cloudflare Dev Worker on port `8787` (`npx wrangler dev` / `npm run dev:worker`).
- **Asset & API Proxy Handling**: The dev worker serves static SPA assets from `./build` alongside local API proxy endpoints (`/api/*`) handled by `src/worker.js`.

## 🚀 Deployment

Build the static files and deploy the Cloudflare Worker + static assets:

```bash
npm run deploy
```
This runs `vite build` followed by `wrangler deploy`. Ensure all environment secrets are set in your Cloudflare dashboard under the project settings.

## 🎨 Make It Your Own

Want to use this as a starting point for your own site?

- **Portfolio content** (experience, projects, skills, links): edit the data files in `src/data/`.
- **Photo gallery**: host your own `gallery.json` and images on Cloudflare R2 (see [Image Gallery Optimization](#-image-gallery-optimization)), or remove the gallery routes.
- **Widgets**: the GitHub contributions, Goodreads, and Codeforces widgets are configured with usernames in `src/data/` and proxied through `src/worker.js` — swap in your own handles or delete the ones you don't want.

For a deeper look at how everything fits together, see the [architecture & technical reference](docs/architecture.md).

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Vite Guide](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [EmailJS Documentation](https://www.emailjs.com/docs/)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ by Simon Chen**
