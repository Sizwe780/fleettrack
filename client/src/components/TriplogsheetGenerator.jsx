export default function TripLogsheetGenerator({ trip }) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">🧾 Trip Logsheet</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Driver:</strong> {trip.driverName}</div>
          <div><strong>Date:</strong> {new Date(trip.date).toLocaleDateString()}</div>
          <div><strong>Origin:</strong> {trip.origin}</div>
          <div><strong>Destination:</strong> {trip.destination}</div>
          <div><strong>Cycle:</strong> {trip.cycle}</div>
          <div><strong>Vehicle:</strong> {trip.vehicleId}</div>
        </div>
  
        <div className="mt-4">
          <strong>Remarks:</strong>
          <p className="border p-2 rounded bg-gray-50">{trip.remarks ?? '—'}</p>
        </div>
  
        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-500">Driver Signature:</p>
          <div className="h-16 border-b border-gray-400 w-64 mt-2" />
        </div>
      </div>
    );
  }