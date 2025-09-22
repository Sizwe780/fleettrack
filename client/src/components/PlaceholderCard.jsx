import React from 'react';

const PlaceholderCard = ({ title = 'Missing Data', message = 'No information available.' }) => {
  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
};

export default PlaceholderCard;