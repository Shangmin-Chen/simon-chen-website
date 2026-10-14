import test from 'node:test';
import assert from 'node:assert/strict';
import { containMediaSize, mediaOrientation, orientationForSource } from '../src/portfolio/domain/media-orientation.js';

test('media orientation classifies portrait, landscape, and near-square source dimensions', () => {
  assert.equal(mediaOrientation(1800, 2400), 'portrait');
  assert.equal(mediaOrientation(1800, 1350), 'landscape');
  assert.equal(mediaOrientation(1440, 960), 'landscape');
  assert.equal(mediaOrientation(100, 105), 'square');
  assert.equal(mediaOrientation(105, 100), 'square');
});

test('unknown and invalid dimensions stay unknown until a valid image loads', () => {
  for (const dimensions of [[0, 20], [20, 0], [-1, 10], [10, NaN], [Infinity, 1]]) {
    assert.equal(mediaOrientation(...dimensions), 'unknown');
  }
});

test('orientation is never reused after the current photo source changes', () => {
  const previous = { source: 'portrait.jpg', orientation: 'portrait' };
  assert.equal(orientationForSource(previous, 'portrait.jpg'), 'portrait');
  assert.equal(orientationForSource(previous, 'landscape.jpg'), 'unknown');
  assert.equal(orientationForSource(null, 'portrait.jpg'), 'unknown');
  assert.equal(orientationForSource(null, undefined), 'unknown');
  assert.equal(orientationForSource({ source: 'portrait.jpg' }, 'portrait.jpg'), 'unknown');
});

test('contained media fits tall, wide, and square sources within the available slot', () => {
  assert.deepEqual(containMediaSize(1800, 2400, 600, 300), { width: 225, height: 300 });
  assert.deepEqual(containMediaSize(1800, 1200, 600, 400), { width: 600, height: 400 });
  assert.deepEqual(containMediaSize(1000, 1000, 300, 600), { width: 300, height: 300 });
  assert.deepEqual(containMediaSize(100, 50, 600, 400), { width: 100, height: 50 });
});

test('contained media stays unknown until both source and available dimensions exist', () => {
  assert.equal(containMediaSize(1800, 2400, 0, 300), null);
  assert.equal(containMediaSize(0, 2400, 600, 300), null);
  assert.equal(containMediaSize(NaN, 2400, 600, 300), null);
});
