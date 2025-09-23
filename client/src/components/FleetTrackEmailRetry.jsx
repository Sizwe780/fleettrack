import React, { useState } from 'react';
import { sendEmail } from './emailUtils';

export default function FleetTrackEmailRetry({ failedLog = [] }) {
  const [retryStatus, setRetryStatus] = useState({});

  const handleRetry = (entry) => {
    setRetryStatus((prev) => ({ ...prev, [entry.timestamp]: 'retrying' }));

    sendEmail({
      to: entry.recipient,
      subject: entry.subject,
      body: entry.body,
    }).then(() => {
      setRetryStatus((prev) => ({ ...prev, [entry.timestamp]: 'sent' }));
    }).catch(() => {
      setRetryStatus((prev) => ({ ...prev, [entry.timestamp]: 'failed' }));
    });
  };

  if (!Array.isArray(failedLog) || failedLog.length === 0) {
    return <p>No failed deliveries to retry.</p>;
  }

  return (
    <div className="mt-10 border rounded-xl p-6 bg-white shadow-md text-sm space-y-6">
      <h2 className="text-xl font-bold">🔁 Retry Failed Email Deliveries</h2>

      <ul className="space-y-4">
        {failedLog.map((entry, i) => (
          <li key={i} className="border-b pb-2">
            <p><strong>To:</strong> {entry.recipient}</p>
            <p><strong>Subject:</strong> {entry.subject}</p>
            <p><strong>Original Timestamp:</strong> {new Date(entry.timestamp).toLocaleString()}</p>
            <button
              onClick={() => handleRetry(entry)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry Delivery
            </button>
            {retryStatus[entry.timestamp] && (
              <p className="text-xs text-gray-500 mt-1">
                Status: {retryStatus[entry.timestamp]}
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-2 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Retry Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(retryStatus, null, 2)}</pre>
      </details>
    </div>
  );
}