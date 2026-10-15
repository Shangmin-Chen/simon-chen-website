import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const publicDir = resolve(root, 'public');
const tokenSource = await readFile(resolve(root, 'src/styles/base/variables.css'), 'utf8');
const token = name => {
  const match = tokenSource.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`Missing social preview color token: ${name}`);
  return match[1].trim();
};

const width = 1200;
const height = 630;
const background = token('color-bg-primary-hsl');
const surface = token('color-bg-secondary-hsl');
const text = token('color-text-primary-hsl');
const border = token('color-border-hsl');
const accent = token('color-accent-hsl');
const toHex = hsl => {
  const [hue, saturation, lightness] = hsl.match(/[\d.]+/g).map(Number);
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const section = hue / 60;
  const x = chroma * (1 - Math.abs(section % 2 - 1));
  const [r, g, b] = section < 1 ? [chroma, x, 0]
    : section < 2 ? [x, chroma, 0]
      : section < 3 ? [0, chroma, x]
        : section < 4 ? [0, x, chroma]
          : section < 5 ? [x, 0, chroma]
            : [chroma, 0, x];
  const m = l - chroma / 2;
  return `#${[r, g, b].map(value => Math.round((value + m) * 255).toString(16).padStart(2, '0')).join('')}`;
};

const artwork = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="surface" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${surface})"/>
      <stop offset="1" stop-color="hsl(${background})"/>
    </linearGradient>
    <pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse">
      <path d="M72 0H0V72" fill="none" stroke="hsl(${border})" stroke-opacity=".23" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#surface)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect x="30" y="30" width="1140" height="570" rx="2" fill="none" stroke="hsl(${border})" stroke-opacity=".55"/>
  <path d="M30 94H530M30 536H585M1170 94H1092M1170 536H1092" stroke="hsl(${border})" stroke-opacity=".58"/>
  <path d="M84 130V112H102M1116 130V112H1098M84 500V518H102M1116 500V518H1098" fill="none" stroke="hsl(${accent})" stroke-width="2"/>
  <path d="M96 411H548L566 393H762" fill="none" stroke="hsl(${accent})" stroke-opacity=".9" stroke-width="2"/>
  <circle cx="762" cy="393" r="4" fill="hsl(${accent})"/>
</svg>`);

const name = await sharp({
  text: {
    text: `<span foreground="${toHex(text)}">SIMON CHEN</span>`,
    font: 'Barlow Condensed, Extra-Bold Italic 144',
    fontfile: resolve(root, 'scripts/assets/BarlowCondensed-ExtraBoldItalic.ttf'),
    width: 720,
    height: 150,
    rgba: true,
    wrap: 'none',
  },
}).png().toBuffer();
const favicon = await readFile(resolve(publicDir, 'favicon.svg'), 'utf8');
const emblemPath = favicon.match(/<path\b[^>]*\/>/)?.[0];
if (!emblemPath) throw new Error('Could not find the intro emblem path in public/favicon.svg');
const transparentEmblem = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" shape-rendering="crispEdges">${emblemPath}</svg>`);
const emblem = await sharp(transparentEmblem)
  .resize(300, 300, { fit: 'contain' })
  .png()
  .toBuffer();

const png = await sharp(artwork)
  .composite([
    { input: name, left: 99, top: 208 },
    { input: emblem, left: 820, top: 156 },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(resolve(publicDir, 'og-image-simon-chen-v2.png'), png);
await sharp(png).jpeg({ quality: 92, mozjpeg: true }).toFile(resolve(publicDir, 'og-image.jpg'));
console.log('Generated versioned social preview and legacy JPEG fallback from the intro emblem.');
