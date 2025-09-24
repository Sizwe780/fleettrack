import React, { useState } from 'react';
import LogsheetBuilder from './LogsheetBuilder';
import SignatureCapture from './SignatureCapture';

export default function TripReportFinalizer({ trip, events }) {
  const [signed, setSigned] = useState(false);

  const handleSignature = (dataUrl) => {
    console.log('Signature captured:', dataUrl);
    setSigned(true);
  };

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded shadow">
      <h3 className="text-lg font-bold mb-4">🧾 Final Trip Report</h3>
      <LogsheetBuilder events={events} />
      <SignatureCapture onSign={handleSignature} />
      {signed && <p className="mt-2 text-green-600 text-sm">✅ Report signed and ready to send.</p>}
    </div>
  );
}