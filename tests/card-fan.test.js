import test from 'node:test';
import assert from 'node:assert/strict';
import { cardFanConnections, cardFanLayout } from '../src/portfolio/domain/card-fan.js';

test('fan layout changes capacity by bounds and preserves fixed curved poses', () => {
  const wide = cardFanLayout(850, 430, true, 12);
  assert.equal(wide.count, 5);
  assert.ok(wide.poses[0].x < wide.poses[4].x);
  assert.ok(wide.poses[0].y > wide.poses[2].y);
  assert.ok(wide.poses[4].y > wide.poses[2].y);
  assert.equal(wide.poses[0].angle, -wide.poses[4].angle);

  const tall = cardFanLayout(589, 700, false, 12);
  assert.equal(tall.count, 3);
  assert.equal(cardFanLayout(354, 450, true, 12).count, 2);
  assert.equal(cardFanLayout(284, 330, true, 12).count, 2);
  assert.equal(cardFanLayout(600, 190, false, 12).count, 1);
});

test('rotated fan-card corners remain within their measured viewport', () => {
  for (const [width, height, expectedCount] of [
    [284, 250, 2],
    [354, 400, 2],
    [589, 500, 3],
    [850, 480, 5],
    [320, 120, 1],
  ]) {
    const { count, poses } = cardFanLayout(width, height, true, 20, height - 20);
    assert.equal(count, expectedCount);
    poses.forEach(pose => {
      const radians = pose.angle * Math.PI / 180;
      const centerX = pose.x + pose.width / 2;
      const centerY = pose.y + pose.height / 2;
      for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const x = centerX + dx * pose.width / 2 * Math.cos(radians) - dy * pose.height / 2 * Math.sin(radians);
        const y = centerY + dx * pose.width / 2 * Math.sin(radians) + dy * pose.height / 2 * Math.cos(radians);
        assert.ok(x >= -0.1 && x <= width + 0.1, `${width}×${height} card x=${x}`);
        assert.ok(y >= -0.1 && y <= height + 0.1, `${width}×${height} card y=${y}`);
      }
    });
  }
});

test('fan connectors share a measured hub trunk and terminate at actual card ports', () => {
  const links = cardFanConnections({ x: -40, y: 50 }, [
    { id: 'a', x: 14, y: 30 },
    { id: 'b', x: 180, y: 70 },
  ]);
  assert.deepEqual(links.map(({ kind, itemId }) => [kind, itemId]), [
    ['trunk', null],
    ['bus', null],
    ['branch', 'a'],
    ['branch', 'b'],
  ]);
  assert.ok(links.every(link => Number.isFinite(link.length) && link.length > 0));
  assert.deepEqual(cardFanConnections(null, []), []);
});

test('an above-fan hub feeds a horizontal bus with measured down-branches', () => {
  const links = cardFanConnections({ x: 120, y: -140 }, [
    { id: 'left', x: 32, y: 50 },
    { id: 'middle', x: 160, y: 24 },
    { id: 'right', x: 310, y: 65 },
  ]);
  assert.deepEqual(links.map(({ kind, itemId }) => [kind, itemId]), [
    ['trunk', null],
    ['bus', null],
    ['branch', 'left'],
    ['branch', 'middle'],
    ['branch', 'right'],
  ]);
  assert.equal(links[1].y, 6);
  assert.equal(links[1].angle, 0);
  assert.ok(links[2].angle > 0 && links[3].angle > 0 && links[4].angle > 0);
});
