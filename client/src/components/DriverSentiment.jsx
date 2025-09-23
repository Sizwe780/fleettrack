import React from 'react';

const sentimentKeywords = {
  positive: ['on time', 'smooth', 'compliant', 'no issues', 'efficient'],
  negative: ['delayed', 'fatigue', 'violation', 'stress', 'breakdown'],
  neutral: ['pickup', 'drop-off', 'traffic', 'standard', 'routine']
};

const analyzeSentiment = (remarks = [], healthScore = 100) => {
  let score = 0;

  remarks.forEach((r) => {
    const lower = r.toLowerCase();
    if (sentimentKeywords.positive.some(k => lower.includes(k))) score += 1;
    if (sentimentKeywords.negative.some(k => lower.includes(k))) score -= 1;
  });

  if (healthScore < 60) score -= 1;
  if (healthScore > 85) score += 1;

  if (score >= 2) return 'Positive';
  if (score <= -1) return 'Negative';
  return 'Neutral';
};

const DriverSentiment = ({ trip }) => {
  const sentiment = analyzeSentiment(trip.remarks, trip.healthScore);
  const color =
    sentiment === 'Positive' ? 'text-green-700 bg-green-100' :
    sentiment === 'Negative' ? 'text-red-700 bg-red-100' :
    'text-gray-700 bg-gray-100';

  return (
    <div className={`px-3 py-2 rounded-md inline-block ${color}`}>
      Driver Sentiment: {sentiment}
    </div>
  );
};

export default DriverSentiment;