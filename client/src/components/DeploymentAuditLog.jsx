export default function DeploymentAuditLog({ logs }) {
    return (
      <div className="mt-6 bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-bold mb-2">🚀 Deployment Log</h3>
        <ul className="text-sm space-y-2">
          {logs.map((log, i) => (
            <li key={i} className="border p-2 rounded bg-gray-50">
              {log.patch} deployed by {log.actor} @ {new Date(log.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    );
  }