import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryLayout } from '../src/portfolio/domain/inventory-layout.js';

test('dossier inventories stay stacked and receive rows that fill the bounded rack', () => {
  const items = [{ kind: 'dossier' }, { kind: 'dossier' }];
  const layout = inventoryLayout(620, 520, items);
  assert.equal(layout.kind, 'dossier');
  assert.equal(layout.columns, 1);
  assert.equal(layout.rows, 2);
  assert.equal(layout.minimumSlotHeight, 178);
});

test('photo columns match the usable width and stop at two columns', () => {
  const items = Array.from({ length: 18 }, () => ({ kind: 'photo' }));
  assert.equal(inventoryLayout(311, 440, items).columns, 1);
  assert.equal(inventoryLayout(312, 440, items).columns, 2);
  assert.equal(inventoryLayout(700, 600, items).columns, 2);
  assert.equal(inventoryLayout(700, 600, items).rows, 2);
  assert.equal(inventoryLayout(700, 440, items).rows, 1);
  assert.equal(inventoryLayout(700, 600, items).minimumSlotHeight, 248);
});

test('short text collections fit visible rows and grow columns only when items fit', () => {
  const items = Array.from({ length: 4 }, () => ({ kind: 'text' }));
  const narrow = inventoryLayout(390, 150, items);
  const roomy = inventoryLayout(520, 440, items);
  assert.equal(narrow.columns, 1);
  assert.equal(narrow.rows, 1);
  assert.equal(roomy.columns, 2);
  assert.equal(roomy.rows, 2);
});

test('empty and sparse collections get only the rows their real content needs', () => {
  const empty = inventoryLayout(500, 600, []);
  const one = inventoryLayout(500, 600, [{ kind: 'text' }]);
  const pair = inventoryLayout(500, 600, [{ kind: 'text' }, { kind: 'text' }]);
  assert.deepEqual([empty.count, empty.rows, empty.columns], [0, 1, 1]);
  assert.deepEqual([one.count, one.rows, one.columns], [1, 1, 1]);
  assert.deepEqual([pair.count, pair.rows, pair.columns], [2, 1, 2]);
});

test('legacy numeric counts remain bounded without creating synthetic item records', () => {
  const layout = inventoryLayout(562, 440, 1_000_000_000);
  assert.equal(layout.count, 1_000_000_000);
  assert.equal(layout.columns, 2);
  assert.equal(layout.minimumSlotWidth, 196);
  assert.equal(layout.minimumSlotHeight, 196);
});
