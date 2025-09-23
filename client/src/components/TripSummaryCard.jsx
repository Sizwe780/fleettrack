export default function TripSummaryCard({ trip }) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-bold mb-2">🚚 Trip Summary</h3>
        <p><strong>Driver:</strong> {trip.driver_name}</p>
        <p><strong>Route:</strong> {trip.origin} → {trip.destination}</p>
        <p><strong>Date:</strong> {new Date(trip.date).toLocaleDateString()}</p>
        <p><strong>Health Score:</strong> {trip.healthScore}/100</p>
        <p><strong>Status:</strong> {trip.status}</p>
        <div className="mt-2">
          <a
            href={`/trip/${trip.tripId}`}
            className="text-blue-600 hover:underline text-sm"
          >
            ▶️ View Replay
          </a>
        </div>
      </div>
    );
  }