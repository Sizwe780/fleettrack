import React from 'react';

const TripInsightsPanel = ({ trip }) => {
  const rawInsights = trip.analysis?.insights;
  const insights = Array.isArray(rawInsights)
    ? rawInsights
    : typeof rawInsights === 'string'
    ? [rawInsights]
    : [];

  return (
    <div className="mt-6 border rounded-xl p-4 bg-white shadow-md">
      <h2 className="text-lg font-bold mb-2">🧠 Strategic Insights</h2>
      <ul className="list-disc ml-4 text-sm space-y-1">
        {insights.length > 0 ? (
          insights.map((i, idx) => <li key={idx}>{i}</li>)
        ) : (
          <li>No insights available.</li>
        )}
      </ul>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-2 rounded text-xs mt-3">
        <summary className="cursor-pointer font-semibold text-gray-700">📈 Insights Payload Debug</summary>
        <pre className="overflow-x-auto mt-1">{JSON.stringify(insights, null, 2)}</pre>
      </details>
    </div>
  );
};

export default TripInsightsPanel;