import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryLayout } from '../src/portfolio/domain/inventory-layout.js';
import { moveInventoryIndex } from '../src/portfolio/domain/card-navigation.js';

test('wide inventories use a single-column upright rack beside the preview', () => {
  const layout = inventoryLayout(850, 440, 20);
  assert.equal(layout.wide, true);
  assert.equal(layout.columns, 1);
  assert.equal(layout.slotHeight, 86);
  assert.equal(layout.capacity, layout.rows);
  assert.ok(layout.capacity >= 2);
  assert.equal(layout.previewHeight, 0);
});

test('compact layouts place a bounded preview above a single-column slot rack', () => {
  for (const [width, height] of [[354, 400], [284, 250], [320, 568]]) {
    const layout = inventoryLayout(width, height, 20);
    assert.equal(layout.wide, false);
    assert.equal(layout.columns, 1);
    assert.ok(layout.previewHeight >= 0 && layout.previewHeight <= layout.availableHeight);
    assert.ok(layout.rackHeight >= 0);
    assert.ok(layout.capacity >= 1 && layout.capacity <= 6);
  }
  assert.equal(inventoryLayout(320, 568, 20).showPreview, true);
});

test('short landscape bounds omit the preview and give the rack the available area', () => {
  const layout = inventoryLayout(459, 145, 20);
  assert.equal(layout.showPreview, false);
  assert.equal(layout.previewHeight, 0);
  assert.equal(layout.rackHeight, layout.availableHeight);
  assert.ok(layout.rows * layout.slotHeight + (layout.rows - 1) * 4 + 34 <= layout.rackHeight + 0.1);
});

test('small item counts do not create phantom slot capacity', () => {
  const layout = inventoryLayout(850, 700, 3);
  assert.equal(layout.capacity, 3);
});

test('capacity stays finite in zero and very short bounds', () => {
  for (const [width, height] of [[0, 0], [320, 100], [560, 120], [625, 200], [320, 250]]) {
    const layout = inventoryLayout(width, height, 12);
    assert.ok(Number.isInteger(layout.capacity) && layout.capacity >= 1);
    assert.ok(Number.isInteger(layout.rows) && layout.rows >= 1);
    assert.ok(layout.slotHeight >= 1 && layout.slotHeight <= 86);
    if (layout.rackHeight >= 34) assert.ok(layout.rows * layout.slotHeight + (layout.rows - 1) * 4 + 34 <= layout.rackHeight + 0.1);
    if (!layout.wide && layout.showPreview && layout.availableHeight >= 12) assert.ok(layout.previewHeight + 12 + layout.rackHeight <= layout.availableHeight + 0.1);
  }
});

test('inventory arrows move one slot horizontally and one rack column vertically', () => {
  assert.equal(moveInventoryIndex(3, 'left', 1, 8), 2);
  assert.equal(moveInventoryIndex(3, 'right', 1, 8), 4);
  assert.equal(moveInventoryIndex(3, 'up', 1, 8), 2);
  assert.equal(moveInventoryIndex(3, 'down', 1, 8), 4);
  assert.equal(moveInventoryIndex(0, 'up', 1, 8), 0);
  assert.equal(moveInventoryIndex(7, 'down', 1, 8), 7);
});
