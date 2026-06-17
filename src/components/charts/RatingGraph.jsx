import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const RatingGraph = ({ contests }) => {
  // Subscribe to theme so the chart re-renders when the theme changes.
  // eslint-disable-next-line no-unused-vars
  const { theme } = useTheme();

  if (!contests || contests.length === 0) return null;

  // Read CSS custom properties so colors always match the active theme.
  const style = getComputedStyle(document.documentElement);
  const textSecondary = style.getPropertyValue('--text-secondary').trim() || '#4a4a4a';
  const accentColor   = style.getPropertyValue('--accent-color').trim()   || '#c8442a';
  const textPrimary   = style.getPropertyValue('--text-primary').trim()   || '#1a1a1a';

  // Sort contests chronologically for graph display (oldest to newest)
  const sortedContests = [...contests].sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds);

  // Transform data for Recharts
  const chartData = sortedContests.map(contest => ({
    date: new Date(contest.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    rating: contest.newRating,
    contestName: contest.contestName,
    contestId: contest.contestId
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-rating">{`Rating: ${payload[0].value}`}</p>
          <p className="tooltip-contest">{data.contestName}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rating-graph">
      <h3>Rating Progression</h3>
      <div className="graph-container">
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 8, fill: textSecondary, fontWeight: 300 }}
            />
            <YAxis
              domain={['dataMin - 50', 'dataMax + 50']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 8, fill: textSecondary, fontWeight: 300 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rating"
              stroke={accentColor}
              strokeWidth={2}
              dot={{ fill: accentColor, strokeWidth: 0, r: 4 }}
              activeDot={{ fill: textPrimary, strokeWidth: 0, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RatingGraph;
