import test from 'node:test';
import assert from 'node:assert/strict';
import { cardIndexFor, moveCardIndex, moveInventoryIndex } from '../src/portfolio/domain/card-navigation.js';

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

test('inventory horizontal navigation stays inside rows and vertical movement uses measured columns', () => {
  assert.equal(moveInventoryIndex(0, 'left', 3, 8), 0);
  assert.equal(moveInventoryIndex(2, 'right', 3, 8), 2);
  assert.equal(moveInventoryIndex(3, 'left', 3, 8), 3);
  assert.equal(moveInventoryIndex(3, 'right', 3, 8), 4);
  assert.equal(moveInventoryIndex(1, 'down', 3, 8), 4);
  assert.equal(moveInventoryIndex(4, 'up', 3, 8), 1);
});

test('inventory navigation handles an incomplete final row and preserves one-column aliases', () => {
  assert.equal(moveInventoryIndex(2, 'down', 3, 5), 4);
  assert.equal(moveInventoryIndex(4, 'down', 3, 5), 4);
  assert.equal(moveInventoryIndex(4, 'right', 3, 5), 4);
  assert.equal(moveInventoryIndex(2, 'up', 3, 18), 2);
  assert.equal(moveInventoryIndex(16, 'down', 3, 18), 16);
  assert.equal(moveInventoryIndex(3, 'left', 1, 8), 2);
  assert.equal(moveInventoryIndex(3, 'up', 1, 8), 2);
});
