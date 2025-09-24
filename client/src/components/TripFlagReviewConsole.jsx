export default function TripFlagReviewConsole({ flaggedTrips, updateFlag }) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">🚨 Flagged Trip Review</h3>
        {flaggedTrips.map(trip => (
          <div key={trip.id} className="border p-3 rounded bg-red-50 mb-2">
            <p><strong>{trip.origin} → {trip.destination}</strong></p>
            <p>Reason: {trip.flagReason}</p>
            <button
              onClick={() => updateFlag(trip.id, 'cleared')}
              className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
            >
              ✅ Clear Flag
            </button>
          </div>
        ))}
      </div>
    );
  }