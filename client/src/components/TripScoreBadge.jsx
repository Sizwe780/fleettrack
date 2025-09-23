import React from 'react';

const TripScoreBadge = ({ score }) => {
  const color =
    score >= 80 ? 'bg-green-100 text-green-800' :
    score >= 50 ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800';

  return (
    <div className={`px-3 py-1 rounded-md text-sm font-semibold inline-block ${color}`}>
      Trip Score: {score}/100
    </div>
  );
};

export default TripScoreBadge;