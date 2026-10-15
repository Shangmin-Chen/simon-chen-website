import test from 'node:test';
import assert from 'node:assert/strict';
import { contributionDetail, contributionFocusTarget, contributionIntensity, contributionWindow, contributionWeekdays } from '../src/portfolio/domain/contributions.js';

test('26-week contribution window is Monday aligned, includes today, and totals only displayed dates', () => {
  const days = [
    { date: '2026-04-20', count: 3 },
    { date: '2026-10-13', count: 5 },
    { date: '2026-10-14', count: 100 },
    { date: '2026-10-15', count: 200 },
  ];
  const result = contributionWindow(days, new Date(2026, 9, 14), 26);

  assert.equal(result.weeks.length, 26);
  assert.equal(result.start, '2026-04-20');
  assert.equal(result.end, '2026-10-14');
  assert.equal(result.weeks[0][0].date, result.start);
  assert.equal(result.weeks.at(-1)[2].date, result.end);
  assert.deepEqual(result.weeks.at(-1).slice(3), [null, null, null, null]);
  assert.equal(result.total, 108);
});

test('contribution labels follow Monday through Sunday and mark month transitions', () => {
  const result = contributionWindow([], new Date(2026, 9, 13), 26);

  assert.deepEqual(contributionWeekdays, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  assert.equal(result.monthLabels.length, 26);
  assert(result.monthLabels.includes('Oct'));
  assert(result.monthLabels.some(label => label !== ''));
});

test('month labels appear once at the week containing the first of each month', () => {
  const result = contributionWindow([], new Date(2026, 9, 13), 26);
  const labels = result.monthLabels.filter(Boolean);

  assert.deepEqual(labels, ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']);
  assert.equal(result.weeks[1][0].date, '2026-04-27');
  assert.equal(result.weeks[1][4].date, '2026-05-01');
  assert.equal(result.monthLabels[1], 'May');
  assert.equal(result.weeks[2][0].date, '2026-05-04');
  assert.equal(result.monthLabels[2], '');
  assert.equal(labels.filter(label => label === 'May').length, 1);
});

test('contribution intensity is bounded and detail text selects a useful day label', () => {
  assert.equal(contributionIntensity(0), 0);
  assert.equal(contributionIntensity(1), 1);
  assert.equal(contributionIntensity(3), 2);
  assert.equal(contributionIntensity(6), 3);
  assert.equal(contributionIntensity(7), 4);
  assert.equal(contributionIntensity(100, 8), 4);
  assert.equal(contributionDetail({ date: '2026-10-13', count: 1 }), '2026-10-13: 1 contribution');
  assert.equal(contributionDetail({ date: '2026-10-14', count: 8 }), '2026-10-14: 8 contributions');
  assert.equal(contributionDetail(null), 'No day selected');
});

test('contribution grid keyboard targets follow weekdays and weeks with useful Home and End keys', () => {
  const weeks = contributionWindow([], new Date(2026, 9, 13), 2).weeks;

  assert.equal(contributionFocusTarget(weeks, '2026-10-13', 'ArrowLeft'), '2026-10-06');
  assert.equal(contributionFocusTarget(weeks, '2026-10-06', 'ArrowRight'), '2026-10-13');
  assert.equal(contributionFocusTarget(weeks, '2026-10-13', 'ArrowUp'), '2026-10-12');
  assert.equal(contributionFocusTarget(weeks, '2026-10-13', 'ArrowDown'), null);
  assert.equal(contributionFocusTarget(weeks, '2026-10-13', 'Home'), '2026-10-06');
  assert.equal(contributionFocusTarget(weeks, '2026-10-06', 'End'), '2026-10-13');
  assert.equal(contributionFocusTarget(weeks, '2026-10-13', 'Control+Home'), '2026-10-05');
  assert.equal(contributionFocusTarget(weeks, '2026-10-13', 'Control+End'), '2026-10-13');
});
