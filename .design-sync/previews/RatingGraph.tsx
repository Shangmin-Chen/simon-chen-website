import { RatingGraph } from 'simon-chen-website';

// Recharts line chart of Codeforces rating history (see CodeforcesPreview.jsx).
// It reads theme tokens via getComputedStyle and renders inside a
// ResponsiveContainer, so the preview gives it an explicit width to size into.
//
// The capture harness freezes the clock, which stalls recharts' rAF-driven
// line animation mid-draw. Drive rAF with an ever-advancing timestamp so the
// chart settles to its final frame for a faithful static capture. This affects
// only this preview card's page; designs the agent builds import the component
// fresh and animate normally.
if (typeof window !== 'undefined' && !(window as { __rgSettle?: boolean }).__rgSettle) {
  (window as { __rgSettle?: boolean }).__rgSettle = true;
  let t = 0;
  window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
    t += 100000;
    Promise.resolve().then(() => cb(t));
    return 0;
  };
}

const day = 86400;
const base = Math.floor(new Date('2024-01-07').getTime() / 1000);
const contests = [
  { contestId: 1901, contestName: 'Codeforces Round 918 (Div. 4)', newRating: 1187, ratingUpdateTimeSeconds: base },
  { contestId: 1915, contestName: 'Codeforces Round 919 (Div. 2)', newRating: 1264, ratingUpdateTimeSeconds: base + day * 21 },
  { contestId: 1927, contestName: 'Educational Codeforces Round 162', newRating: 1342, ratingUpdateTimeSeconds: base + day * 49 },
  { contestId: 1933, contestName: 'Codeforces Round 925 (Div. 3)', newRating: 1298, ratingUpdateTimeSeconds: base + day * 70 },
  { contestId: 1941, contestName: 'Codeforces Round 929 (Div. 3)', newRating: 1405, ratingUpdateTimeSeconds: base + day * 98 },
  { contestId: 1955, contestName: 'Codeforces Round 938 (Div. 3)', newRating: 1521, ratingUpdateTimeSeconds: base + day * 133 },
  { contestId: 1969, contestName: 'Educational Codeforces Round 165', newRating: 1487, ratingUpdateTimeSeconds: base + day * 168 },
  { contestId: 1985, contestName: 'Codeforces Round 952 (Div. 4)', newRating: 1603, ratingUpdateTimeSeconds: base + day * 203 },
];

export const Progression = () => (
  <div style={{ width: 520, maxWidth: '100%' }}>
    <RatingGraph contests={contests} />
  </div>
);
