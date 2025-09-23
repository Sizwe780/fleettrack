import React from 'react';

const TripInsightsPanel = ({ trip }) => {
  const insights = trip.analysis?.insights ?? [];

  return (
    <div className="mt-6 border rounded-xl p-4 bg-white shadow-md">
      <h2 className="text-lg font-bold mb-2">🧠 Strategic Insights</h2>
      <ul className="list-disc ml-4 text-sm space-y-1">
        {insights.length > 0 ? insights.map((i, idx) => <li key={idx}>{i}</li>) : <li>No insights available.</li>}
      </ul>
    </div>
  );
};

export default TripInsightsPanel;