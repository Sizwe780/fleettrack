import React from 'react';
import TripLogsheetExporter from './TripLogsheetExporter';

const ExportButton = ({ targetId, filename }) => (
  <button
    onClick={() => TripLogsheetExporter(targetId, filename)}
    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm"
  >
    📤 Export PDF
  </button>
);

export default ExportButton;