import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeFrame, signalSeed, textGraphemes } from '../src/portfolio/domain/decode.js';

test('decode frames preserve whitespace and resolve to the exact Unicode phrase', () => {
  const phrase = 'A 👨‍👩‍👧‍👦 中文\nSimón';
  const seed = signalSeed('gallery-caption');
  const frame = decodeFrame(phrase, 0, { seed });
  assert.deepEqual(
    textGraphemes(frame).map(character => /^\s+$/u.test(character) ? character : null),
    textGraphemes(phrase).map(character => /^\s+$/u.test(character) ? character : null),
  );
  assert.equal(decodeFrame(phrase, 10, { seed }), phrase);
  assert.equal(decodeFrame(phrase, 4, { seed }), decodeFrame(phrase, 4, { seed }));
  assert.deepEqual(textGraphemes('👨‍👩‍👧‍👦é'), ['👨‍👩‍👧‍👦', 'é']);
});

test('resolved glyphs stay resolved as the decode advances', () => {
  const phrase = 'abcdefghijklmnop';
  const early = decodeFrame(phrase, 3, { seed: 21 });
  const later = decodeFrame(phrase, 7, { seed: 21 });
  [...early].forEach((character, index) => {
    if (character !== phrase[index]) return;
    assert.equal(later[index], character);
  });
});
