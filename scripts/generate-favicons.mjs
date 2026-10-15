import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const introPath = resolve(root, 'src/portfolio/assets/intro.json');
const variablesPath = resolve(root, 'src/styles/base/variables.css');
const outputDir = resolve(root, 'public');
const rows = JSON.parse(await readFile(introPath, 'utf8'));
const variables = await readFile(variablesPath, 'utf8');
const token = name => {
  const match = variables.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`Missing favicon color token: ${name}`);
  return match[1].trim();
};

if (!rows.length || rows.some(row => typeof row !== 'string')) {
  throw new TypeError('Intro emblem must be a non-empty array of strings');
}

const columns = Math.max(...rows.map(row => row.length));
const cellWidth = 0.6;
const width = 64;
const height = 64;
const markWidth = columns * cellWidth;
const xOffset = (width - markWidth) / 2;
const yOffset = (height - rows.length) / 2;
const path = rows.flatMap((row, y) => {
  const padded = row.padEnd(columns, ' ');
  const commands = [];
  let start = -1;
  for (let x = 0; x <= columns; x++) {
    const occupied = x < columns && padded[x] !== ' ';
    if (occupied && start < 0) start = x;
    if (!occupied && start >= 0) {
      commands.push(`M${start} ${y}h${x - start}v1h-${x - start}z`);
      start = -1;
    }
  }
  return commands;
}).join('');

const background = token('color-bg-primary-hsl');
const accent = token('color-accent-hsl');
const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges"><rect width="${width}" height="${height}" fill="hsl(${background})"/><path d="${path}" transform="translate(${xOffset} ${yOffset}) scale(${cellWidth} 1)" fill="hsl(${accent})"/></svg>\n`;
const svgBuffer = Buffer.from(svg);

await writeFile(resolve(outputDir, 'favicon.svg'), svg);
await writeFile(resolve(outputDir, 'favicon-dark.svg'), svg);
await writeFile(resolve(outputDir, 'favicon-light.svg'), svg);
const renderPng = size => sharp(svgBuffer).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
const iconSizes = [16, 32];
const iconPngs = await Promise.all(iconSizes.map(renderPng));
for (const size of [32, 192, 512]) {
  const png = size === 32 ? iconPngs[1] : await renderPng(size);
  await writeFile(resolve(outputDir, `favicon-${size}.png`), png);
}
await writeFile(resolve(outputDir, 'apple-touch-icon.png'), await renderPng(180));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(iconSizes.length, 4);
const entries = Buffer.alloc(iconSizes.length * 16);
let imageOffset = header.length + entries.length;
iconPngs.forEach((png, index) => {
  const size = iconSizes[index];
  const offset = index * 16;
  entries.writeUInt8(size, offset);
  entries.writeUInt8(size, offset + 1);
  entries.writeUInt8(0, offset + 2);
  entries.writeUInt8(0, offset + 3);
  entries.writeUInt16LE(1, offset + 4);
  entries.writeUInt16LE(32, offset + 6);
  entries.writeUInt32LE(png.length, offset + 8);
  entries.writeUInt32LE(imageOffset, offset + 12);
  imageOffset += png.length;
});
await writeFile(resolve(outputDir, 'favicon.ico'), Buffer.concat([header, entries, ...iconPngs]));

console.log('Generated favicon SVG, ICO, PNG, and Apple touch icons from the intro emblem.');
