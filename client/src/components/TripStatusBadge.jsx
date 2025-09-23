import React from 'react';

const TripStatusBadge = ({ status }) => {
  const colorMap = {
    pending: 'bg-gray-400',
    active: 'bg-blue-500',
    completed: 'bg-green-600',
    flagged: 'bg-red-600',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-white text-xs ${colorMap[status] ?? 'bg-gray-300'}`}>
      {status?.toUpperCase()}
    </span>
  );
};

export default TripStatusBadge;