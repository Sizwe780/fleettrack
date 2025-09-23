import React from 'react';
import { buildExportBundle } from './TripExportBundleBuilder';

const TripExportPreview = ({ trip }) => {
  const preview = buildExportBundle(trip);

  return (
    <div className="mt-6 border rounded p-4 bg-gray-50 text-sm whitespace-pre-wrap">
      <h2 className="text-lg font-bold mb-2">📄 Export Preview</h2>
      {preview}
    </div>
  );
};

export default TripExportPreview;