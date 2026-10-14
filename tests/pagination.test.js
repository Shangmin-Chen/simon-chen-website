import test from 'node:test';
import assert from 'node:assert/strict';
import { accumulateWheelDelta, clampPage, expandedFileOffset, focusOffset, pageAtOffset, pageCount, pageOffset, pageStep } from '../src/portfolio/domain/pagination.js';

test('measured page count leaves overlap and covers the complete document', () => {
  assert.equal(pageCount(0, 100), 1);
  assert.equal(pageCount(100, 100), 1);
  assert.equal(pageCount(101, 100), 2);
  assert.equal(pageCount(270, 100), 4);
  assert.equal(pageStep(100), 68);
  assert.throws(() => pageCount(-1, 100), TypeError);
});

test('pageOffset overlaps pages and clamps the last page to the document end', () => {
  assert.equal(pageOffset(0, 270, 100), 0);
  assert.equal(pageOffset(1, 270, 100), 68);
  assert.equal(pageOffset(2, 270, 100), 136);
  assert.equal(pageOffset(3, 270, 100), 170);
  assert.equal(pageOffset(99, 270, 100), 170);
  assert.equal(clampPage(-2, 3), 0);
  assert.equal(clampPage(8, 3), 2);
});

test('pageAtOffset keeps custom reveals on the page before the natural last offset', () => {
  assert.equal(pageAtOffset(250, 602, 232), 1);
  assert.equal(pageAtOffset(370, 602, 232), 2);
});

test('wheel deltas accumulate below the shared ten-pixel threshold and reset direction', () => {
  let state = accumulateWheelDelta(0, 3);
  assert.equal(state.ready, false);
  state = accumulateWheelDelta(state.total, 4);
  assert.equal(state.ready, false);
  state = accumulateWheelDelta(state.total, 4);
  assert.deepEqual(state, { total: 11, direction: 1, ready: true });
  state = accumulateWheelDelta(state.total, -4);
  assert.deepEqual(state, { total: -4, direction: -1, ready: false });
});

test('focusOffset keeps a focused control completely inside the viewport', () => {
  assert.equal(focusOffset(140, 205, 30, 100, 400), 140);
  assert.equal(focusOffset(140, 110, 45, 100, 400), 110);
  assert.equal(focusOffset(140, 215, 45, 100, 400), 160);
  assert.equal(focusOffset(140, 375, 45, 100, 400), 300);
});

test('focusOffset aligns an expanded body that fits even when its end is below the viewport', () => {
  assert.equal(focusOffset(0, 250, 300, 376, 1_000), 174);
  assert.equal(focusOffset(0, 250, 500, 376, 1_000), 250);
});

test('expanded files align a compact page anchor when the full body is taller than the viewport', () => {
  assert.equal(expandedFileOffset(0, 0, 376, 200, 164, 232, 900), 132);
  assert.equal(expandedFileOffset(0, 0, 376, 20, 280, 232, 900), 20);
  assert.equal(expandedFileOffset(0, 0, 200, 80, 100, 232, 900), 0);
});
