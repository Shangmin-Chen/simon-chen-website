const isoDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function contributionWindow(days, now, weekCount = 13) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - (today.getDay() + 6) % 7 - (weekCount - 1) * 7);
  const byDate = new Map(days.map(day => [day.date, day]));
  const weeks = Array.from({ length: weekCount }, (_, week) => Array.from({ length: 7 }, (_, weekday) => {
    const date = new Date(start);
    date.setDate(start.getDate() + week * 7 + weekday);
    if (date > today) return null;
    const iso = isoDate(date);
    const day = byDate.get(iso);
    return { date: iso, count: Math.max(0, day?.count ?? 0), level: Math.max(0, Math.min(4, day?.level ?? 0)) };
  }));
  return {
    weeks,
    total: weeks.flat().reduce((sum, day) => sum + (day?.count ?? 0), 0),
    start: isoDate(start),
    end: isoDate(today),
  };
}
