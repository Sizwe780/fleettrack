export default function ExportReadinessScanner({ trips }) {
    const blocked = trips.filter(t => !t.audit_hash || !t.driverSignature || t.computedHash !== t.audit_hash);
  
    return (
      <div className="panel">
        <h2>📦 Export Readiness Scanner</h2>
        {blocked.length > 0 ? (
          <ul>
            {blocked.map((t, i) => (
              <li key={i}>
                {t.tripId} — Missing: {[
                  !t.driverSignature && 'Signature',
                  !t.audit_hash && 'Audit Hash',
                  t.computedHash !== t.audit_hash && 'Hash Mismatch'
                ].filter(Boolean).join(', ')}
              </li>
            ))}
          </ul>
        ) : (
          <p>✅ All trips ready for export</p>
        )}
      </div>
    );
  }