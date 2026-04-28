# Simon Chen - Portfolio Website

A modern, responsive portfolio website built with React and Vite, featuring smooth animations, contact form integration via a lightweight Cloudflare Worker, and static hosting on Cloudflare.

> **Note**: This README documents a migration from GitHub Pages. The site can be served from **Cloudflare Workers** (worker + static assets) or exposed via **Cloudflare Tunnel** if you self-host elsewhere.

## 🚀 Live Demo

Visit the live website: [https://simon-chen.com](https://simon-chen.com)

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0, JavaScript (ES6+), Vite
- **Styling**: CSS3 with custom animations
- **Email**: EmailJS invoked from a Cloudflare Worker (`src/worker.js`); the browser only calls `POST /api/contact`
- **Smooth Scrolling**: Lenis for enhanced user experience
- **Hosting**: Cloudflare Workers + Assets (`wrangler.jsonc`)

## 💻 Local development

Prerequisites: [Node.js](https://nodejs.org/) 20+ (recommended).

1. **Clone and install**
   ```bash
   git clone https://github.com/shangmin-chen/simon-chen-website
   cd simon-chen-website
   npm install
   ```

2. **Run the Vite dev server**
   ```bash
   npm run dev
   ```
   Opens at [http://localhost:3000](http://localhost:3000).

3. **Contact form (optional)**: Copy `.dev.vars.example` to `.dev.vars`, add your EmailJS values, then in a second terminal run `npm run dev:worker` so `/api` requests proxy to the worker.

## 📧 EmailJS setup

1. **Create an EmailJS account** at [EmailJS](https://www.emailjs.com/) and set up a service + template.
2. **Worker environment**: Set `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, and `EMAILJS_PUBLIC_KEY` as Worker secrets in the Cloudflare dashboard or with `wrangler secret put …`. For local testing, use `.dev.vars` (see `.dev.vars.example`).
3. **Origin allowlist**: Restrict allowed origins in the EmailJS dashboard for your domain(s).

## 🔧 Configuration

- **Dev server port**: `server.port` in `vite.config.js` (default `3000`).
- **API proxy during `npm run dev`**: `server.proxy['/api']` in `vite.config.js` targets `wrangler dev` on port `8787`.

## 🚀 Deployment

Build and deploy the Worker plus static assets to Cloudflare:

```bash
npm run deploy
```

This runs `vite build` then `wrangler deploy`. Ensure Worker secrets are set in your Cloudflare account for the `simon-chen-website` worker (or whatever name you use in `wrangler.jsonc`).

## 📚 Additional resources

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Vite](https://vite.dev/)
- [React](https://react.dev/)
- [EmailJS](https://www.emailjs.com/docs/)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ by Simon Chen**
