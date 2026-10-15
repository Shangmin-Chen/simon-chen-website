import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryLayout } from '../src/portfolio/domain/inventory-layout.js';
import { moveInventoryIndex } from '../src/portfolio/domain/card-navigation.js';

test('wide inventory keeps its preview beside a one-column rack', () => {
  const layout = inventoryLayout(850, 440);
  assert.equal(layout.wide, true);
  assert.equal(layout.columns, 1);
  assert.equal(layout.showPreview, true);
  assert.ok(layout.minimumSlotHeight > 0);
});

test('rack sizing is independent of item count so CSS can fill the measured rack', () => {
  const wide = inventoryLayout(850, 440);
  const stacked = inventoryLayout(390, 844);
  assert.ok(wide.rackHeight > 0);
  assert.ok(stacked.rackHeight > 0);
  assert.equal(wide.minimumSlotHeight, 58);
  assert.equal(stacked.minimumSlotHeight, 52);
});

test('stacked layouts keep a bounded preview above the rack when there is room', () => {
  for (const [width, height] of [[354, 400], [284, 250], [320, 568]]) {
    const layout = inventoryLayout(width, height);
    assert.equal(layout.wide, false);
    assert.equal(layout.columns, 1);
    assert.ok(layout.previewHeight >= 0 && layout.previewHeight <= layout.availableHeight);
    assert.ok(layout.rackHeight >= 0);
  }
  assert.equal(inventoryLayout(320, 568, 20).showPreview, true);
});

test('very short stacked layouts omit the preview and retain an internally scrollable rack', () => {
  const layout = inventoryLayout(459, 145);
  assert.equal(layout.showPreview, false);
  assert.equal(layout.previewHeight, 0);
  assert.equal(layout.rackHeight, layout.availableHeight);
});

test('sizing remains bounded at zero, narrow, and short heights', () => {
  for (const [width, height] of [[0, 0], [320, 100], [560, 120], [625, 200], [320, 250]]) {
    const layout = inventoryLayout(width, height);
    assert.equal(layout.columns, 1);
    assert.ok(Number.isFinite(layout.rackHeight) && layout.rackHeight >= 0);
    assert.ok(Number.isFinite(layout.minimumSlotHeight) && layout.minimumSlotHeight >= 1);
    if (!layout.wide && layout.showPreview) assert.ok(layout.previewHeight + 7 + layout.rackHeight <= layout.availableHeight + 1);
  }
});

test('inventory arrows move one item at a time in the single-column rail', () => {
  assert.equal(moveInventoryIndex(3, 'left', 1, 8), 2);
  assert.equal(moveInventoryIndex(3, 'right', 1, 8), 4);
  assert.equal(moveInventoryIndex(3, 'up', 1, 8), 2);
  assert.equal(moveInventoryIndex(3, 'down', 1, 8), 4);
  assert.equal(moveInventoryIndex(0, 'up', 1, 8), 0);
  assert.equal(moveInventoryIndex(7, 'down', 1, 8), 7);
});
