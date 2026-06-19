import React, { lazy, Suspense } from 'react';
import useCodeforcesData from '../hooks/useCodeforcesData';
import { codeforcesData } from '../data/codeforcesData';

// Keep recharts out of the main bundle — only loaded when the preview opens.
const RatingGraph = lazy(() => import('./charts/RatingGraph'));

function codeforcesLedgerStats(contests, userInfo) {
  const contestCount = contests.length;
  const fromHistoryPeak =
    contestCount > 0 ? Math.max(...contests.map((c) => c.newRating)) : undefined;
  const current =
    userInfo?.rating ?? (contestCount > 0 ? contests[0].newRating : undefined);
  const peak =
    userInfo?.maxRating != null
      ? Math.max(userInfo.maxRating, fromHistoryPeak ?? 0)
      : fromHistoryPeak;

  return { current, peak, contestCount };
}

const CodeforcesPreview = () => {
  const { contests, userInfo, loading, error } = useCodeforcesData();

  if (error) {
    return (
      <p className="cf-preview-msg cf-error-msg">
        {codeforcesData.messages.error} {error}
      </p>
    );
  }

  if (loading) {
    return <p className="cf-preview-msg cf-loading-msg">{codeforcesData.messages.loading}</p>;
  }

  const { current, peak, contestCount } = codeforcesLedgerStats(contests, userInfo);
  const stats = [
    { num: current, label: codeforcesData.stats.currentRating },
    { num: peak, label: codeforcesData.stats.peak },
    { num: contestCount, label: codeforcesData.stats.contests },
  ];

  return (
    <div className="cf-preview">
      <div className="cf-preview-stats">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="cf-preview-num">{s.num != null ? s.num : '—'}</div>
            <div className="cf-preview-label">{s.label}</div>
          </div>
        ))}
      </div>
      <Suspense fallback={null}>
        <RatingGraph contests={contests} />
      </Suspense>
      <a
        href={codeforcesData.profile.url}
        target="_blank"
        rel="noopener noreferrer"
        className="cf-profile-link"
        aria-label={`@${codeforcesData.profile.handle} on Codeforces`}
      >
        @{codeforcesData.profile.handle}
      </a>
    </div>
  );
};

export default CodeforcesPreview;
