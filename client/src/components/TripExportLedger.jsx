import React from 'react';

export default function TripExportLedger({ trips }) {
  const ledger = trips.map(t => ({
    tripId: t.tripId,
    exported: !!t.exportedAt,
    signed: !!t.driverSignature,
    hashMatch: t.computedHash === t.audit_hash
  }));

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📜 Trip Export Ledger</h2>
      <table className="w-full text-sm">
        <thead><tr><th>Trip ID</th><th>Exported</th><th>Signed</th><th>Hash Match</th></tr></thead>
        <tbody>
          {ledger.map((t, i) => (
            <tr key={i}>
              <td>{t.tripId}</td>
              <td>{t.exported ? '✅' : '❌'}</td>
              <td>{t.signed ? '✅' : '❌'}</td>
              <td>{t.hashMatch ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}