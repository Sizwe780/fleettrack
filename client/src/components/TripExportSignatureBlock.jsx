import React from 'react';

export default function TripExportSignatureBlock({ driverName }) {
  return (
    <div className="mt-6 border-t pt-4 text-sm text-gray-700">
      <p>Driver Signature:</p>
      <div className="mt-2 h-16 border border-gray-300 rounded bg-gray-50 flex items-center justify-center italic text-gray-500">
        {driverName || '—'} (signed electronically)
      </div>
      <p className="mt-2 text-xs text-gray-500">Timestamp: {new Date().toLocaleString()}</p>
    </div>
  );
}