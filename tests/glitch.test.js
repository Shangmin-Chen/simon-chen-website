import test from 'node:test';
import assert from 'node:assert/strict';
import { applyGlitchBands, glitchPlan } from '../src/portfolio/domain/glitch.js';
import { introFrame } from '../src/portfolio/domain/portrait.js';

test('band translation moves glyph and color together, clips both edges, and preserves input', () => {
  const source = [[['a', 1], ['b', 2], ['c', 3], ['d', 4]], [['e', 5], ['f', 6], ['g', 7], ['h', 8]]];
  const right = applyGlitchBands(source, [{ y: 0, height: 1, dx: 1 }]);
  const left = applyGlitchBands(source, [{ y: 0, height: 1, dx: -1 }]);
  assert.deepEqual(right, [[[' ', 1], ['a', 1], ['b', 2], ['c', 3]], source[1]]);
  assert.deepEqual(left, [[['b', 2], ['c', 3], ['d', 4], [' ', 1]], source[1]]);
  assert.deepEqual(source, [[['a', 1], ['b', 2], ['c', 3], ['d', 4]], [['e', 5], ['f', 6], ['g', 7], ['h', 8]]]);
});

test('plans are deterministic, hold between steps, include rests, and pulse both directions', () => {
  const opts = { width: 80, height: 30, burst: true };
  const sequence = Array.from({ length: 10 }, (_, tick) => glitchPlan(0x494e5452, tick, opts));
  assert.deepEqual(sequence[0], sequence[1]);
  assert.deepEqual(sequence[2], sequence[3]);
  assert.equal(sequence[8].active, false);
  assert.equal(sequence[9].active, false);
  const shifts = sequence.flatMap(plan => plan.bands.map(band => band.dx));
  assert(shifts.some(dx => dx < 0));
  assert(shifts.some(dx => dx > 0));
  assert(sequence[2].bands.every(band => band.refreshTick === 3));
  assert(sequence[6].bands.every(band => band.refreshTick === 5));
  assert.deepEqual(sequence, Array.from({ length: 10 }, (_, tick) => glitchPlan(0x494e5452, tick, opts)));
  const idlePulses = Array.from({ length: 750 }, (_, slot) => glitchPlan(0x494e5452, slot * 4, { width: 80, height: 30 }).active).filter(Boolean).length;
  assert(idlePulses < 15);
});

test('bands hold a sampled source frame through their cadence, then jump to the next sample', () => {
  const matrixAt = tick => Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => String(tick)));
  const sampleBand = { y: 1, height: 1, dx: 0, refreshTick: 3 };
  const sample = refreshTick => matrixAt(refreshTick);
  const heldAt2 = applyGlitchBands(matrixAt(2), [sampleBand], { sampleFrame: sample });
  const heldAt3 = applyGlitchBands(matrixAt(3), [sampleBand], { sampleFrame: sample });
  const jumpedAt4 = applyGlitchBands(matrixAt(4), [{ ...sampleBand, refreshTick: 4 }], { sampleFrame: sample });
  assert.deepEqual(heldAt2[1], heldAt3[1]);
  assert.deepEqual(heldAt2[1], Array(8).fill('3'));
  assert.deepEqual(jumpedAt4[1], Array(8).fill('4'));
});

test('intro settles at frame 25 and motion off returns the approved static glyph', () => {
  const lines = ['  /##\\', '  ####'];
  assert.equal(introFrame(lines, 25), lines.join('\n'));
  assert.equal(introFrame(lines, 1, false), lines.join('\n'));
  assert(introFrame(lines, 3).split('\n').every(line => line.length === 6));
});
