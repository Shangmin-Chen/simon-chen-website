const noise = ['#', '/', '_', '?', '+', '='];

function hash(value) {
  let next = value | 0;
  next = Math.imul(next ^ (next >>> 16), 0x45d9f3b);
  next = Math.imul(next ^ (next >>> 16), 0x45d9f3b);
  return (next ^ (next >>> 16)) >>> 0;
}

export function textGraphemes(value) {
  const text = String(value ?? '');
  if (typeof Intl.Segmenter === 'function') {
    return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(part => part.segment);
  }
  return Array.from(text);
}

export function signalSeed(value) {
  return textGraphemes(value).reduce((seed, grapheme) => {
    let next = seed;
    for (const character of grapheme) next = Math.imul(next ^ character.codePointAt(0), 16777619);
    return next >>> 0;
  }, 2166136261);
}

// Returns a deterministic, whitespace-preserving decode frame. The real text
// remains in the UI's semantic source; callers use this only in aria-hidden art.
export function decodeFrame(value, tick, { steps = 10, seed = 0 } = {}) {
  const graphemes = textGraphemes(value);
  if (!graphemes.length || tick >= steps) return graphemes.join('');
  const progress = Math.max(0, tick) / Math.max(1, steps);
  return graphemes.map((grapheme, index) => {
    if (/^\s+$/u.test(grapheme)) return grapheme;
    const signal = hash(seed + index * 0x9e3779b9);
    if (signal / 0x100000000 < progress) return grapheme;
    return noise[hash(signal + Math.trunc(tick / 2)) % noise.length];
  }).join('');
}
