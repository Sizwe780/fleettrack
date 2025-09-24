import React from 'react';

const statusColors = {
  planned: 'bg-gray-200 text-gray-700',
  assigned: 'bg-blue-100 text-blue-700',
  en_route: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  flagged: 'bg-red-100 text-red-700',
  critical: 'bg-red-200 text-red-800'
};

const TripTimeline = ({ statusHistory = [] }) => {
  if (!statusHistory.length) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Trip Timeline</h3>
      <ul className="space-y-2">
        {statusHistory.map((entry, index) => {
          const { status, timestamp } = entry;
          const color = statusColors[status] || 'bg-gray-100 text-gray-600';
          const formattedTime = new Date(timestamp).toLocaleString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <li key={index} className={`px-3 py-2 rounded-md ${color}`}>
              <span className="font-medium capitalize">{status.replace('_', ' ')}</span>{' '}
              <span className="text-xs ml-2">{formattedTime}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TripTimeline;