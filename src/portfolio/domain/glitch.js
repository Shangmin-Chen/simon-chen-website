// Deterministic horizontal frame-refresh distortion shared by all ASCII views.
// Callers own the clock and seed; this module has no runtime or browser effects.
const hash = value => {
  let n = value | 0;
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return (n ^ (n >>> 16)) >>> 0;
};

const interferenceSignals = ['cyan', 'pink', 'amber'];

export function interferenceAt(interference, x, y) {
  if (!interference) return false;
  return interference.mode === 'wash' || hash(interference.seed + y * 257 + x * 37) % 100 < 58;
}

// Return only interference-visible glyphs after the band shift, padding the
// clipped edge with spaces. This matches the cell matrix transform below.
export function interferenceBandText(lines, band) {
  return lines.map((line, y) => Array.from(line, (character, x) => {
    const destinationX = x + band.dx;
    const inBand = y >= band.y && y < band.y + band.height;
    return inBand && character !== ' ' && destinationX >= 0 && destinationX < line.length && interferenceAt(band.interference, destinationX, y)
      ? character : ' ';
  }).join('')).join('\n');
}

export function glitchPlan(seed, tick, { width, height, burst = false } = {}) {
  if (width < 1 || height < 1 || tick < 0) return { active: false, bands: [] };
  const burstFrame = burst && tick < 25;
  const cadence = burstFrame ? Math.floor(tick / 2) : Math.floor(tick / 4);
  const cadenceSize = burstFrame ? 2 : 4;
  // Click bursts advance in short steps; idle transmission pulses are sparse,
  // with deterministic skipped slots and rests.
  if (burstFrame ? cadence % 5 === 4 : hash(seed + cadence * 31) % 96 !== 0) return { active: false, bands: [] };
  const count = burstFrame ? 2 + hash(seed + cadence * 7) % 3 : 1 + hash(seed + cadence * 13) % 2;
  const bands = [];
  for (let i = 0; i < count; i++) {
    const h = hash(seed + cadence * 101 + i * 37);
    const bandHeight = Math.min(height, 1 + h % Math.max(1, Math.min(3, height)));
    const y = h % Math.max(1, height - bandHeight + 1);
    const magnitude = 1 + (h >>> 8) % Math.max(1, Math.min(5, Math.ceil(width / 8)));
    const sampleShift = cadence % 3 === 0 ? -1 : cadence % 3 === 1 ? 1 : 0;
    const refreshTick = Math.max(0, cadence * cadenceSize + sampleShift);
    const interferenceSeed = hash(h + cadence * 17);
    bands.push({
      y,
      height: bandHeight,
      dx: (h & 0x1000) ? magnitude : -magnitude,
      refreshTick,
      interference: {
        signal: interferenceSignals[interferenceSeed % interferenceSignals.length],
        mode: cadence % 3 === 0 ? 'wash' : 'speckle',
        seed: interferenceSeed,
      },
    });
  }
  return { active: bands.length > 0, bands };
}

// Translate whole bands without wrapping. Row cells may be characters or
// [character, color] tuples; source data and dimensions are never changed.
export function applyGlitchBands(matrix, bands, { sampleFrame = () => matrix, colorForSignal } = {}) {
  if (!bands.length) return matrix;
  const result = matrix.map(row => row.map(cell => Array.isArray(cell) ? [...cell] : cell));
  const height = matrix.length;
  const width = matrix[0]?.length ?? 0;
  for (const { y, height: bandHeight, dx, refreshTick, interference } of bands) {
    const sampled = refreshTick === undefined ? matrix : sampleFrame(refreshTick);
    for (let rowIndex = Math.max(0, y); rowIndex < Math.min(height, y + bandHeight); rowIndex++) {
      const source = sampled[rowIndex] ?? matrix[rowIndex];
      const blank = Array.isArray(source[0]) ? [' ', source[0][1]] : ' ';
      result[rowIndex] = Array.from({ length: width }, (_, x) => {
        const sourceX = x - dx;
        if (sourceX < 0 || sourceX >= width) return Array.isArray(blank) ? [...blank] : blank;
        const cell = source[sourceX];
        if (!Array.isArray(cell)) return cell;
        const translated = [...cell];
        if (colorForSignal && cell[0] !== ' ' && interferenceAt(interference, x, rowIndex)) {
          const mappedColor = colorForSignal(interference.signal, { character: cell[0], color: cell[1], x, y: rowIndex });
          if (mappedColor !== undefined && mappedColor !== null) translated[1] = mappedColor;
        }
        return translated;
      });
    }
  }
  return result;
}

export function applyGlitchToLines(lines, bands, options) {
  const matrix = lines.map(line => Array.from(line));
  return applyGlitchBands(matrix, bands, options).map(row => row.join(''));
}
