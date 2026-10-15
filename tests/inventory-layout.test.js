import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryLayout } from '../src/portfolio/domain/inventory-layout.js';

test('inventory columns use actual rack width and adapt across phone and native sizes', () => {
  assert.equal(inventoryLayout(265, 360, 18).columns, 1);
  assert.equal(inventoryLayout(327, 500, 18).columns, 2);
  assert.equal(inventoryLayout(562, 440, 18).columns, 3);
  assert.equal(inventoryLayout(562, 440, 2).columns, 2);
});

test('column capacity grows monotonically as rack width grows', () => {
  const widths = [240, 265, 327, 490, 562, 850];
  const columns = widths.map(width => inventoryLayout(width, 440, 18).columns);
  assert.deepEqual(columns, [...columns].sort((left, right) => left - right));
});

test('tile minimum height stays comfortable so short racks scroll rather than compressing artwork', () => {
  for (const [width, height] of [[265, 360], [327, 500], [562, 440], [562, 120], [0, 0]]) {
    const layout = inventoryLayout(width, height, 18);
    assert.ok(Number.isFinite(layout.columns) && layout.columns >= 1);
    assert.ok(Number.isFinite(layout.minimumSlotWidth) && layout.minimumSlotWidth >= 0);
    assert.ok(Number.isFinite(layout.minimumSlotHeight) && layout.minimumSlotHeight >= 0);
    assert.ok(layout.minimumSlotWidth <= Math.max(1, width));
    assert.equal(layout.minimumSlotHeight, 184);
  }
});
