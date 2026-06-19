import React, { useMemo } from 'react';
import useGithubContributions from '../hooks/useGithubContributions';
import { githubData } from '../data/githubData';

// Lay the flat day list out into GitHub-style week columns (one column per
// week, seven rows Sun→Sat). Leading slots before the first day stay empty.
function toWeeks(days) {
  const weeks = [];
  let week = new Array(7).fill(null);

  days.forEach((day) => {
    const dow = new Date(`${day.date}T00:00:00`).getDay();
    week[dow] = day;
    if (dow === 6) {
      weeks.push(week);
      week = new Array(7).fill(null);
    }
  });

  if (week.some(Boolean)) weeks.push(week);
  return weeks;
}

const GitHubPreview = () => {
  const { days, total, loading, error } = useGithubContributions();
  const weeks = useMemo(() => toWeeks(days), [days]);

  if (error) {
    return (
      <p className="cf-preview-msg cf-error-msg">
        {githubData.messages.error} {error}
      </p>
    );
  }

  if (loading) {
    return (
      <p className="cf-preview-msg cf-loading-msg">{githubData.messages.loading}</p>
    );
  }

  return (
    <div className="gh-preview">
      <div
        className="gh-cal"
        role="img"
        aria-label={`${total} GitHub contributions in the last year`}
      >
        {weeks.map((week, wi) => (
          <div className="gh-col" key={wi}>
            {week.map((day, di) => (
              <span
                key={di}
                className={day ? `gh-cell lvl-${day.level}` : 'gh-cell gh-cell--empty'}
                title={
                  day
                    ? `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`
                    : undefined
                }
              />
            ))}
          </div>
        ))}
      </div>
      <div className="gh-preview-foot">
        <span className="gh-total">{total} contributions in the last year</span>
        <a
          href={githubData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="cf-profile-link"
          aria-label={`${githubData.handle} on GitHub`}
        >
          {githubData.handle}
        </a>
      </div>
    </div>
  );
};

export default GitHubPreview;
