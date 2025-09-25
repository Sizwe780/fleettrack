import React from 'react';

const TripStatusBadge = ({ status }) => {
    const colorMap = {
        pending: 'bg-platinum',
        active: 'bg-darkBlue',
        completed: 'bg-emerald',
        flagged: 'bg-charcoal',
    };

  return (
    <span className={`px-3 py-1 rounded-full text-white text-xs ${colorMap[status] ?? 'bg-gray-300'}`}>
      {status?.toUpperCase()}
    </span>
  );
};

export default TripStatusBadge;