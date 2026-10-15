import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { accumulateWheelDelta, sections, wrapIndex, signedCircularOffset, sectionSelectorPositions, sectionSelectorStageHeight, sectionSelectorOptionHeight, sectionFromLocation } from '../src/portfolio/domain/navigation.js';
import { validateContact } from '../src/portfolio/domain/contact.js';
import { contributionWindow } from '../src/portfolio/domain/contributions.js';
import { portraitFrame, introFrame, colorRuns } from '../src/portfolio/domain/portrait.js';
import { photoAlt } from '../src/portfolio/domain/photos.js';

const crew = JSON.parse(readFileSync(new URL('../src/portfolio/assets/crew.json', import.meta.url)));
const intro = JSON.parse(readFileSync(new URL('../src/portfolio/assets/intro.json', import.meta.url)));

test('looping section selector keeps five centered, non-overlapping targets within compact widths', () => {
  assert.deepEqual(crew.map(member => member.section), sections);
  assert.equal(wrapIndex(-1), 4);
  assert.equal(wrapIndex(5), 0);
  assert.equal(wrapIndex(-16), 4);
  for (const width of [280, 292, 320, 358]) {
    for (let selected = 0; selected < sections.length; selected++) {
      const positions = sectionSelectorPositions(width, selected);
      assert.equal(positions.length, 5);
      assert(positions.every(position => position.width >= 52 && Number.isFinite(position.arcY) && Number.isFinite(position.opacity)));
      const bounds = positions.map(position => {
        const scaledWidth = position.width * position.scale;
        return [position.left + (position.width - scaledWidth) / 2, position.left + (position.width + scaledWidth) / 2];
      });
      const verticalBounds = positions.map(position => {
        const scaledHeight = sectionSelectorOptionHeight * position.scale;
        const top = position.arcY + position.lift - (scaledHeight - sectionSelectorOptionHeight) / 2;
        return [top, top + scaledHeight];
      });
      assert(Math.min(...bounds.map(([left]) => left)) >= -1e-6);
      assert(Math.max(...bounds.map(([, right]) => right)) <= width + 1e-6);
      const orderedBounds = [...positions].sort((a, b) => a.offset - b.offset).map(position => {
        const scaledWidth = position.width * position.scale;
        return [position.left + (position.width - scaledWidth) / 2, position.left + (position.width + scaledWidth) / 2];
      });
      for (let index = 1; index < orderedBounds.length; index++) assert(orderedBounds[index - 1][1] < orderedBounds[index][0]);
      assert(verticalBounds.every(([top, bottom]) => top >= 0 && bottom <= sectionSelectorStageHeight));
      assert.equal(positions[selected].offset, 0);
      assert.equal(positions[selected].scale, 1.06);
      assert.equal(positions[selected].lift, -4);
      assert.equal(positions[selected].arcY, 42);
      assert.equal(positions[selected].front, 1);
      assert.equal(positions[selected].opacity, 1);
      assert.equal(positions[selected].depth, 250);
      assert.equal(Math.min(...positions.map(position => position.arcY)), 4);
    }
  }
});

test('selector offsets wrap in both directions and remain stable across full rotations', () => {
  assert.equal(signedCircularOffset(0, 4), 1);
  assert.equal(signedCircularOffset(4, 0), -1);
  assert.equal(signedCircularOffset(0, 9), 1);
  assert.equal(signedCircularOffset(4, 10), -1);
  assert(Math.abs(signedCircularOffset(3, 1.4) - signedCircularOffset(3, 16.4)) < 1e-9);
  const oneRotation = sectionSelectorPositions(320, 0.4);
  const severalRotations = sectionSelectorPositions(320, 15.4);
  for (let index = 0; index < oneRotation.length; index++) {
    assert(Math.abs(oneRotation[index].offset - severalRotations[index].offset) < 1e-9);
    assert(Math.abs(oneRotation[index].left - severalRotations[index].left) < 1e-9);
    assert(Math.abs(oneRotation[index].opacity - severalRotations[index].opacity) < 1e-9);
  }
});

test('selector fades the unique seam button before its circular offset wraps', () => {
  const before = sectionSelectorPositions(320, 2.49)[0];
  const after = sectionSelectorPositions(320, 2.51)[0];
  assert(before.offset < -2.4);
  assert(after.offset > 2.4);
  assert(before.opacity < 0.01);
  assert(after.opacity < 0.01);
  for (const selected of [0, 1, 2, 3, 4]) {
    assert(sectionSelectorPositions(320, selected).every(position => position.opacity === 1));
  }
});

test('gallery deep links and legacy anchors map to the appropriate character', () => {
  assert.equal(sectionFromLocation({ pathname: '/gallery/shanghai-study-abroad', hash: '' }), 'pictures');
  assert.equal(sectionFromLocation({ pathname: '/', hash: '#projects' }), 'projects');
  assert.equal(sectionFromLocation({ pathname: '/', hash: '#now' }), 'hobbies');
  assert.equal(sectionFromLocation({ pathname: '/', hash: '#gallery' }), 'pictures');
  assert.equal(sectionFromLocation({ pathname: '/', hash: '#unknown' }), 'whoami');
});

test('section selector accumulates small trackpad deltas without losing direction changes', () => {
  const first = accumulateWheelDelta(0, 3);
  assert.equal(first.ready, false);
  const second = accumulateWheelDelta(first.total, 4);
  assert.equal(second.ready, false);
  const third = accumulateWheelDelta(second.total, 5);
  assert.equal(third.ready, true);
  assert.equal(third.direction, 1);
  const reverse = accumulateWheelDelta(third.total, -2);
  assert.equal(reverse.total, -2);
  assert.equal(reverse.direction, -1);
});

test('ASCII frame dimensions and palette indices are valid for all five characters', () => {
  for (const { portrait } of crew) {
    assert.equal(portrait.width, 72);
    assert.equal(portrait.height, 33);
    assert.equal(portrait.grid.length, 33);
    assert.equal(portrait.palette.length, 20);
    for (const row of portrait.grid) {
      assert.equal(row.length, 72);
      for (const [character, index] of row) {
        assert.match(character, /^[\x20-\x7e]$/);
        assert(Number.isInteger(index) && index >= 0 && index < portrait.palette.length);
      }
      assert.equal(colorRuns(row).map(run => run.text).join(''), row.map(cell => cell[0]).join(''));
    }
  }
});

test('gaze, blink, and glitch never mutate the source or change frame dimensions', () => {
  for (const { portrait } of crew) {
    const original = JSON.stringify(portrait);
    assert.deepEqual(portraitFrame(portrait), portrait.grid);
    for (const tick of [1, 104, 118]) {
      const frame = portraitFrame(portrait, { tick, motion: true, gaze: { x: 1, y: -1 }, burst: tick === 1 });
      assert.equal(frame.length, 33);
      assert(frame.every(row => row.length === 72 && row.every(cell => cell[1] >= 0 && cell[1] <= 25)));
    }
    assert.equal(JSON.stringify(portrait), original);
  }
  const maine = crew.find(member => member.id === 'maine').portrait;
  assert.equal(maine.eyes.length, 0);
  assert.deepEqual(portraitFrame(maine, { motion: true, tick: 118, gaze: { x: 1, y: 1 } }), maine.grid);
});

test('approved emblem settles to the original glyph and preserves every row width', () => {
  assert.equal(intro.length, 61);
  assert(intro.every(line => line.length === 60));
  assert.equal(introFrame(intro, 25), intro.join('\n'));
  assert(introFrame(intro, 1).split('\n').every(line => line.length === 60));
});

test('contribution window starts Monday, includes today, and leaves future days blank', () => {
  const days = [{ date: '2026-10-12', count: 4, level: 1 }, { date: '2026-10-13', count: 7, level: 2 }, { date: '2026-10-14', count: 999, level: 4 }];
  const result = contributionWindow(days, new Date(2026, 9, 13));
  assert.equal(result.start, '2026-07-20');
  assert.equal(result.end, '2026-10-13');
  assert.equal(result.weeks.length, 13);
  assert.equal(result.total, 11);
  assert.equal(result.weeks.at(-1)[1].date, '2026-10-13');
  assert.deepEqual(result.weeks.at(-1).slice(2), Array(5).fill(null));
  const sunday = contributionWindow([], new Date(2026, 9, 18));
  assert(sunday.weeks.at(-1).every(Boolean));
});

test('contact validation trims values, rejects blanks, invalid email, and server length limits', () => {
  const valid = { name: ' Simon ', email: ' hello@example.com ', subject: ' hello ', message: ' message ' };
  assert.deepEqual(validateContact(valid).values, { name: 'Simon', email: 'hello@example.com', subject: 'hello', message: 'message' });
  assert(validateContact(valid).valid);
  assert.equal(Object.keys(validateContact({}).fields).length, 4);
  assert(validateContact({ ...valid, email: 'wrong' }).fields.email);
  assert(validateContact({ ...valid, message: 'x'.repeat(5001) }).fields.message);
});

test('photo descriptions prefer actual captions over generic manifest alt labels', () => {
  assert.equal(photoAlt({ alt: 'Shanghai, photo 9', caption: 'The Huangpu River ferry' }), 'The Huangpu River ferry');
  assert.equal(photoAlt({ alt: 'Sunset on the river', caption: 'Photo 1' }), 'Sunset on the river');
  assert.equal(photoAlt({ location: 'Shanghai' }), 'Shanghai photograph');
});
