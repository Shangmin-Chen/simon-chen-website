import test from 'node:test';
import assert from 'node:assert/strict';
import { cardIndexFor, cardIndexOnPage, cardPageIndex, cardPageStart, moveCardIndex } from '../src/portfolio/domain/card-navigation.js';
import { accumulateWheelDelta } from '../src/portfolio/domain/navigation.js';

const cards = Array.from({ length: 7 }, (_, index) => ({ id: `card-${index}` }));

test('card selection and page ranges retain the selected item across page changes', () => {
  assert.equal(cardIndexFor(cards, 'card-5'), 5);
  assert.equal(cardIndexFor(cards, 'missing'), 0);
  assert.equal(cardPageIndex(5, 4, cards.length), 1);
  assert.equal(cardPageStart(6, 4, cards.length), 4);
  assert.equal(cardIndexOnPage(2, 4, cards.length), 4);
  assert.equal(cardIndexOnPage(-1, 4, cards.length), 0);
  assert.equal(cardPageStart(0, 4, 0), -1);
});

test('grid movement clamps at the collection edges and accounts for columns', () => {
  assert.equal(moveCardIndex(1, 1, cards.length), 2);
  assert.equal(moveCardIndex(1, 2, cards.length), 3);
  assert.equal(moveCardIndex(0, -2, cards.length), 0);
  assert.equal(moveCardIndex(6, 3, cards.length), 6);
});

test('wheel deltas accumulate until a page gesture is recognized', () => {
  const first = accumulateWheelDelta(0, 26, 72);
  assert.deepEqual(first, { total: 26, direction: 1, ready: false });
  const second = accumulateWheelDelta(first.total, 52, 72);
  assert.deepEqual(second, { total: 78, direction: 1, ready: true });
  assert.deepEqual(accumulateWheelDelta(second.total, -80, 72), { total: -80, direction: -1, ready: true });
});
