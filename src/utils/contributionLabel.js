// One phrasing for a day's activity, shared by the contribution ship and the
// calendar in §02 Now so the same day reads identically in both.
export const contributionDayLabel = (date, count) => {
  const when = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  return `${when} · ${count === 0 ? 'no' : count} contribution${count === 1 ? '' : 's'}`;
};

export default contributionDayLabel;
