export default function TripViewerAuditTrail({ logs }) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">📜 Audit Trail</h3>
        <ul className="text-sm space-y-1">
          {logs.map((log, i) => (
            <li key={i} className="border p-2 rounded bg-gray-50">
              {log.action} by {log.actor} @ {new Date(log.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    );
  }