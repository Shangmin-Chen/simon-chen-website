import test from 'node:test';
import assert from 'node:assert/strict';
import { cardIndexFor, moveCardIndex } from '../src/portfolio/domain/card-navigation.js';

const cards = Array.from({ length: 7 }, (_, index) => ({ id: `card-${index}` }));

test('card selection retains the active collection item', () => {
  assert.equal(cardIndexFor(cards, 'card-5'), 5);
  assert.equal(cardIndexFor(cards, 'missing'), 0);
});

test('grid movement clamps at the collection edges and accounts for columns', () => {
  assert.equal(moveCardIndex(1, 1, cards.length), 2);
  assert.equal(moveCardIndex(1, 2, cards.length), 3);
  assert.equal(moveCardIndex(0, -2, cards.length), 0);
  assert.equal(moveCardIndex(6, 3, cards.length), 6);
});
