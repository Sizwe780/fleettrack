export default function StudentSafetyOverlay({ driver, location }) {
    const alert = triggerPanicAlert({ driver, trip: { id: "trip-001" }, location });
    const broadcast = broadcastPanic(alert.alertPayload);
    escalateIfNoResponse(alert.alertId, location);
  
    return (
      <section className="bg-red-50 p-6 rounded-xl shadow-md border border-red-300">
        <h3 className="text-lg font-bold text-red-700 mb-2">🛡️ Student Safety Activated</h3>
        <p className="text-sm text-gray-700 mb-2">Alert ID: <strong>{alert.alertId}</strong></p>
        <p className="text-sm text-gray-700 mb-2">Broadcasting to:</p>
        <ul className="list-disc ml-4 text-sm text-gray-700 mb-2">
          {broadcast.recipients.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
        <p className="text-xs text-gray-600">Geo-fenced escalation will trigger if no response in 60 seconds.</p>
      </section>
    );
  }