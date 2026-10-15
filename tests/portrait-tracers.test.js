import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { portraitEyeCenters, portraitFrame } from '../src/portfolio/domain/portrait.js';
import { portraitEyePoints, tracerSegment } from '../src/portfolio/domain/portrait-tracers.js';

const crew = JSON.parse(readFileSync(new URL('../src/portfolio/assets/crew.json', import.meta.url)));

test('portrait eye centers move horizontally only and omit characters without eye data', () => {
  const david = crew.find(member => member.id === 'david').portrait;
  const neutral = portraitEyeCenters(david, 0);
  const left = portraitEyeCenters(david, -1);
  const right = portraitEyeCenters(david, 1);

  assert.deepEqual(neutral.map(eye => eye.y), left.map(eye => eye.y));
  assert.deepEqual(neutral.map(eye => eye.y), right.map(eye => eye.y));
  assert.ok(left.every((eye, index) => eye.x < neutral[index].x));
  assert.ok(right.every((eye, index) => eye.x > neutral[index].x));
  assert.deepEqual(
    portraitFrame(david, { motion: true, tick: 4, gaze: { x: 0.5, y: -1 } }),
    portraitFrame(david, { motion: true, tick: 4, gaze: { x: 0.5, y: 1 } }),
  );
  assert.deepEqual(portraitEyeCenters(crew.find(member => member.id === 'maine').portrait), []);
});

test('eye points stay in viewport coordinates and include the title row and left frame column', () => {
  const portrait = crew.find(member => member.id === 'david').portrait;
  const points = portraitEyePoints(portrait, {
    textRect: { left: 100, top: 50 },
    charWidth: 8,
    lineHeight: 8,
    gazeX: 0,
  });
  assert.equal(points.length, 2);
  const [eyeX, eyeY] = portrait.eyes[0].center;
  assert.equal(points[0].x, 100 + (eyeX + 1.5) * 8);
  assert.equal(points[0].y, 50 + (eyeY + 1.5) * 8);
  assert.ok(points[0].x > 100 && points[0].y > 50);
  assert.deepEqual(portraitEyePoints(crew.find(member => member.id === 'maine').portrait, {
    textRect: { left: 100, top: 50 }, charWidth: 8, lineHeight: 8,
  }), []);
});

test('tracer segment geometry points from the moving iris center to the cursor', () => {
  assert.deepEqual(tracerSegment({ x: 3, y: 4 }, { x: 6, y: 8 }), {
    left: 3,
    top: 4,
    length: 5,
    angle: Math.atan2(4, 3),
  });
});
