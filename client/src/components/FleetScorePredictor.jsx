export default function FleetScorePredictor({ trips }) {
    const recentScores = trips.slice(0, 10).map(t => t.healthScore ?? 0);
    const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const forecast = Math.round(avg * 0.98); // Slight decay model
  
    return (
      <div className="mt-6 bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-bold mb-2">📊 Fleet Score Forecast</h3>
        <p className="text-sm">Next Month Projection: {forecast}/100</p>
      </div>
    );
  }