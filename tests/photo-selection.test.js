import test from 'node:test';
import assert from 'node:assert/strict';
import { movePhotoIndex, normalizePhotoIndex, restorePhotoIndex } from '../src/portfolio/domain/photo-selection.js';

test('photo selection stays within album bounds and handles empty albums', () => {
  assert.equal(normalizePhotoIndex(-5, 4), 0);
  assert.equal(normalizePhotoIndex(8, 4), 3);
  assert.equal(normalizePhotoIndex(2.8, 4), 2);
  assert.equal(movePhotoIndex(0, -1, 4), 0);
  assert.equal(movePhotoIndex(3, 1, 4), 3);
  assert.equal(movePhotoIndex(1, 1, 0), null);
  assert.equal(normalizePhotoIndex(0, 0), null);
});

test('photo selection restores independently for each album', () => {
  const saved = { city: 5, coast: 2 };
  assert.equal(restorePhotoIndex(saved, 'city', 8), 5);
  assert.equal(restorePhotoIndex(saved, 'coast', 8), 2);
  assert.equal(restorePhotoIndex(saved, 'new-album', 3), 0);
  assert.equal(restorePhotoIndex(saved, 'city', 2), 1);
  assert.equal(restorePhotoIndex(saved, 'empty', 0), null);
});
