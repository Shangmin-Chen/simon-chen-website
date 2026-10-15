import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceNameCycle, initialNameCycleState, nameGraphemes } from '../src/portfolio/domain/name-cycle.js';

test('name cycle counts grapheme clusters and never inserts an empty inter-language frame', () => {
  const entries = [
    { text: 'A\u0301👩🏽‍💻', lang: 'en' },
    { text: 'BC', lang: 'en' },
  ];
  assert.deepEqual(nameGraphemes(entries[0].text), ['A\u0301', '👩🏽‍💻']);

  let state = initialNameCycleState(entries);
  assert.equal(state.visible, 2);
  while (state.phase === 'hold') state = advanceNameCycle(state, entries);
  state = advanceNameCycle(state, entries);
  assert.equal(state.visible, 1);
  state = advanceNameCycle(state, entries);
  assert.deepEqual(state, { index: 1, visible: 1, phase: 'type', remaining: 0 });
  state = advanceNameCycle(state, entries);
  assert.equal(state.visible, 2);
  state = advanceNameCycle(state, entries);
  assert.equal(state.phase, 'hold');
});
