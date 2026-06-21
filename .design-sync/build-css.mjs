// Flatten the design system's CSS for /design-sync.
// The repo's `src/styles/index.css` is a tree of relative @imports; the
// converter copies cfg.cssEntry verbatim to the bundle root, where those
// relative paths would dangle. esbuild bundles them into one flat file with
// the global class names intact (no CSS modules in this repo). The Google
// Fonts @import is prepended so the brand families (Fraunces, JetBrains Mono)
// — which the app loads from a <link> in index.html, not from CSS — load at
// runtime for every design built with this DS.
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const GOOGLE_FONTS =
  '@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,300..900,0..100&family=JetBrains+Mono:wght@400;500&display=swap");\n';

const OUT = '.design-sync/styles.bundled.css';

await build({
  entryPoints: ['src/styles/index.css'],
  bundle: true,
  outfile: OUT,
  logLevel: 'warning',
  loader: { '.svg': 'dataurl', '.png': 'dataurl', '.woff': 'dataurl', '.woff2': 'dataurl' },
});

const css = readFileSync(OUT, 'utf8');
writeFileSync(OUT, GOOGLE_FONTS + css);
console.error(`css: flattened src/styles/index.css → ${OUT} (${(css.length / 1024).toFixed(0)} KB)`);
