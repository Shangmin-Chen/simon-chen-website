import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const RatingGraph = ({ contests }) => {
  if (!contests || contests.length === 0) return null;

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
              tick={{ fontSize: 8, fill: '#888', fontWeight: 300 }}
            />
            <YAxis 
              domain={['dataMin - 50', 'dataMax + 50']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 8, fill: '#888', fontWeight: 300 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="rating" 
              stroke="#666" 
              strokeWidth={2}
              dot={{ fill: '#666', strokeWidth: 0, r: 4 }}
              activeDot={{ fill: '#1a1a1a', strokeWidth: 0, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RatingGraph;
