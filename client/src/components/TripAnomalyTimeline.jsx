export default function TripAnomalyTimeline({ anomalies }) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md mt-6">
        <h3 className="text-lg font-bold mb-2">🚨 Trip Anomaly Timeline</h3>
        <ul className="space-y-2 text-sm">
          {anomalies.map((a, i) => (
            <li key={i} className="border p-2 rounded bg-red-50">
              {a.tripId} — {a.type} @ {new Date(a.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    );
  }