import React from 'react';

const TripSignatureBlock = ({ driverName }) => {
  const name = driverName || '—';

  return (
    <div className="mt-6 text-sm border-t pt-4 space-y-1">
      <p>Driver: <strong>{name}</strong></p>
      <p>Signature: ____________________________</p>
      <p>Date: _________________________________</p>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-2 rounded text-xs mt-2">
        <summary className="cursor-pointer font-semibold text-gray-700">✍️ Signature Debug</summary>
        <pre className="overflow-x-auto mt-1">{JSON.stringify({ driverName: name }, null, 2)}</pre>
      </details>
    </div>
  );
};

export default TripSignatureBlock;