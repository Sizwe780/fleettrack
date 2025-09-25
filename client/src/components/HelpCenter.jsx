import React from 'react';

export default function HelpCenter() {
  return (
    <div className="bg-white p-6 rounded-xl shadow mt-10 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🆘 Help Center</h2>
      <ul className="list-disc pl-5 text-sm space-y-2">
        <li><strong>How do I export a trip?</strong> Go to TripExportEngine and click "Export PDF/CSV".</li>
        <li><strong>Why is my logsheet incomplete?</strong> Check metadataFlags and signature status in TripLogsheetPro.</li>
        <li><strong>How do I reset my password?</strong> Use the Login screen and click "Forgot Password".</li>
        <li><strong>Need more help?</strong> Contact support at support@fleettrack.africa</li>
      </ul>
    </div>
  );
}