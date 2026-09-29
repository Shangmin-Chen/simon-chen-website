import { useMemo } from 'react';
import useGithubContributions from './useGithubContributions';
import { contributionDayLabel } from '../utils/contributionLabel';
import { githubData } from '../data/githubData';

const { ship } = githubData;

// 13 weeks of days, laid out for the plate. Shared so the hero's masthead and
// the drawing itself read from one computation rather than two that can drift.
export const WEEKS = 13;
export const ROWS = 7;
export const CELLS = WEEKS * ROWS;

// getDay() is Sun=0 … Sat=6; map it onto the drawing's row order Mon…Fri, Sat, Sun.
const DOW_ROW = [6, 0, 1, 2, 3, 4, 5];

function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Lay the flat day list out into 13 week-columns ending with the current,
// still-unfinished week, so the grid always includes today. Days later this
// week have not happened yet and render as unlit "not yet" windows.
//
// Columns start on Monday to match the drawing's row order — on a Sunday-start
// week the SU porthole would hold the Sunday *before* its own column's Monday,
// six days out of order and sitting below days that haven't happened yet.
function toGrid(days) {
  const byDate = new Map(days.map((day) => [day.date, day]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sinceMonday = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - sinceMonday - (WEEKS - 1) * ROWS);

  const cells = [];
  for (let i = 0; i < CELLS; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const day = byDate.get(toIsoDate(date));
    const count = day?.count ?? 0;
    const future = date > today;

    cells.push({
      iso: toIsoDate(date),
      col: Math.floor(i / ROWS),
      row: DOW_ROW[date.getDay()],
      count,
      level: day?.level ?? 0,
      future,
      label: future
        ? `${date.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })} · ${ship.messages.future}`
        : contributionDayLabel(date, count)
    });
  }
  return cells;
}

const useContributionWindow = () => {
  const { days, loading, error } = useGithubContributions();
  const cells = useMemo(() => toGrid(days), [days]);
  const total = useMemo(() => cells.reduce((sum, cell) => sum + cell.count, 0), [cells]);

  // The hero never interrupts on a failed fetch — the plate simply draws
  // unlit. The Now section surfaces the error where the detail lives.
  const hasData = !loading && !error;

  return {
    cells,
    total,
    hasData,
    contributions: hasData
      ? `${total.toLocaleString()} ${ship.labels.contributions}`
      : ship.labels.empty
  };
};

export default useContributionWindow;
