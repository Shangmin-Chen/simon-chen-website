import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sections, wrapIndex, wheelOffset, wheelPosition, sectionFromLocation } from '../src/portfolio/domain/navigation.js';
import { validateContact } from '../src/portfolio/domain/contact.js';
import { contributionWindow } from '../src/portfolio/domain/contributions.js';
import { portraitFrame, introFrame, colorRuns } from '../src/portfolio/domain/portrait.js';
import { photoAlt } from '../src/portfolio/domain/photos.js';

const crew = JSON.parse(readFileSync(new URL('../src/portfolio/assets/crew.json', import.meta.url)));
const intro = JSON.parse(readFileSync(new URL('../src/portfolio/assets/intro.json', import.meta.url)));

test('crew mapping, wraparound, and compact wheel keep every section reachable', () => {
  assert.deepEqual(crew.map(member => member.section), sections);
  assert.equal(wrapIndex(-1), 4);
  assert.equal(wrapIndex(5), 0);
  assert.equal(wrapIndex(-16), 4);
  for (let selected = 0; selected < 5; selected++) {
    const visible = crew.map((_, index) => wheelPosition(wheelOffset(index, selected), 284, true)).filter(position => !position.hidden);
    assert.equal(visible.length, 3);
    assert(visible.every(position => Number.isFinite(position.x) && Number.isFinite(position.y)));
  }
});

test('gallery deep links and legacy anchors map to the appropriate character', () => {
  assert.equal(sectionFromLocation({ pathname: '/gallery/shanghai-study-abroad', hash: '' }), 'pictures');
  assert.equal(sectionFromLocation({ pathname: '/', hash: '#projects' }), 'projects');
  assert.equal(sectionFromLocation({ pathname: '/', hash: '#now' }), 'hobbies');
  assert.equal(sectionFromLocation({ pathname: '/', hash: '#gallery' }), 'pictures');
  assert.equal(sectionFromLocation({ pathname: '/', hash: '#unknown' }), 'whoami');
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
