import React from 'react';

export default function FleetPredictionFeed({ feed }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {feed.map((item, i) => (
        <div key={i} className="bg-white border rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-indigo-700 text-sm mb-1">
            {item.domain.toUpperCase()}
          </h4>
          <p className="text-gray-800 text-sm">
            Prediction: <strong>{item.prediction}</strong>
          </p>
          <p className="text-xs text-gray-500">
            Confidence: {(item.confidence * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 italic">
            Projected: {new Date(item.projectedDate).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}