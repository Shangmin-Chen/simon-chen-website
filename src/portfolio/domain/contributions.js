const isoDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const contributionWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const contributionGlyphs = ['·', '░', '▒', '▓', '█'];

export function contributionIntensity(count, level) {
  if (Number.isFinite(level)) return Math.max(0, Math.min(4, Math.round(level)));
  if (!Number.isFinite(count) || count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function contributionDetail(day) {
  if (!day) return 'No day selected';
  return `${day.date}: ${day.count.toLocaleString()} ${day.count === 1 ? 'contribution' : 'contributions'}`;
}

export function contributionFocusTarget(weeks, date, key) {
  const weekIndex = weeks.findIndex(week => week.some(day => day?.date === date));
  if (weekIndex < 0) return null;
  const weekdayIndex = weeks[weekIndex].findIndex(day => day?.date === date);
  let targetWeek = weekIndex;
  let targetWeekday = weekdayIndex;

  if (key === 'ArrowLeft') targetWeek -= 1;
  else if (key === 'ArrowRight') targetWeek += 1;
  else if (key === 'ArrowUp') targetWeekday -= 1;
  else if (key === 'ArrowDown') targetWeekday += 1;
  else if (key === 'Home') return weeks.map(week => week[weekdayIndex]).find(Boolean)?.date ?? null;
  else if (key === 'End') return weeks.map(week => week[weekdayIndex]).filter(Boolean).at(-1)?.date ?? null;
  else if (key === 'Control+Home' || key === 'Meta+Home') return weeks.flat().find(Boolean)?.date ?? null;
  else if (key === 'Control+End' || key === 'Meta+End') return weeks.flat().filter(Boolean).at(-1)?.date ?? null;
  else return null;

  if (targetWeek < 0 || targetWeek >= weeks.length || targetWeekday < 0 || targetWeekday > 6) return null;
  const exact = weeks[targetWeek][targetWeekday];
  if (exact) return exact.date;

  return null;
}

export function contributionWindow(days, now, weekCount = 13) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const count = Math.max(1, Math.floor(weekCount));
  const start = new Date(today);
  start.setDate(today.getDate() - (today.getDay() + 6) % 7 - (count - 1) * 7);
  const byDate = new Map(days.map(day => [day.date, day]));
  const weeks = Array.from({ length: count }, (_, week) => Array.from({ length: 7 }, (_, weekday) => {
    const date = new Date(start);
    date.setDate(start.getDate() + week * 7 + weekday);
    if (date > today) return null;
    const iso = isoDate(date);
    const source = byDate.get(iso);
    const contributionCount = Math.max(0, source?.count ?? 0);
    return { date: iso, count: contributionCount, level: contributionIntensity(contributionCount, source?.level) };
  }));
  const visibleDays = weeks.flat().filter(Boolean);
  return {
    weeks,
    total: visibleDays.reduce((sum, day) => sum + day.count, 0),
    start: isoDate(start),
    end: isoDate(today),
    monthLabels: weeks.map(week => {
      const monthStart = week.find(day => day?.date.slice(-2) === '01');
      if (!monthStart) return '';
      const date = new Date(`${monthStart.date}T00:00:00`);
      return date.toLocaleString('en-US', { month: 'short' });
    }),
  };
}
