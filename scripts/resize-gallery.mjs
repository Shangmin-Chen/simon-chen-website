#!/usr/bin/env node
// Precompute web-ready gallery images. Reads full-resolution photos from an
// input dir and writes optimized `-full` (carousel/lightbox) and `-thumb`
// (album grid) JPEGs to an output dir, preserving each base filename.
//
//   node scripts/resize-gallery.mjs <inputDir> <outputDir>
//   npm run gallery:resize -- <inputDir> <outputDir>
//
// Then upload <outputDir> to R2 and reference the produced filenames as photo
// `full`/`thumb` keys in gallery.json. Requires `sharp` (devDependency).
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { encode } from 'blurhash';

const FULL_WIDTH = 1800;
const THUMB_WIDTH = 700;
const QUALITY = 80;
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic']);

const [inputDir, outputDir] = process.argv.slice(2);
if (!inputDir || !outputDir) {
  console.error('Usage: node scripts/resize-gallery.mjs <inputDir> <outputDir>');
  process.exit(1);
}

await mkdir(outputDir, { recursive: true });
const entries = await readdir(inputDir);
const photos = entries.filter((f) => EXTS.has(path.extname(f).toLowerCase()));

if (photos.length === 0) {
  console.error(`No images found in ${inputDir}`);
  process.exit(1);
}

const variants = [
  { suffix: 'full', width: FULL_WIDTH },
  { suffix: 'thumb', width: THUMB_WIDTH },
];

async function calculateBlurhash(imagePath) {
  const { data, info } = await sharp(imagePath)
    .rotate()
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });

  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}

for (const file of photos) {
  const base = path.basename(file, path.extname(file));
  const src = path.join(inputDir, file);

  const blurhash = await calculateBlurhash(src);

  for (const { suffix, width } of variants) {
    const out = path.join(outputDir, `${base}-${suffix}.jpg`);
    await sharp(src)
      .rotate() // respect EXIF orientation before stripping metadata
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(out);
    console.log(`✓ ${out}`);
  }

  console.log(`  Blurhash: ${blurhash}`);
}

console.log(
  `\nDone — ${photos.length} photo(s) → ${photos.length * variants.length} files in ${outputDir}`
);
