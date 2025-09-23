import React from 'react';
import { buildExportBundle } from './TripExportBundleBuilder';

const TripExportPreview = ({ trip }) => {
  const preview = buildExportBundle(trip) ?? '⚠️ No export data available.';

  return (
    <div className="mt-6 border rounded p-4 bg-gray-50 text-sm whitespace-pre-wrap">
      <h2 className="text-lg font-bold mb-2">📄 Export Preview</h2>
      {preview}

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-white border mt-4 p-3 rounded text-xs">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Export Payload Debug</summary>
        <pre className="overflow-x-auto mt-1">{JSON.stringify(trip, null, 2)}</pre>
      </details>
    </div>
  );
};

export default TripExportPreview;