import React, { useState } from 'react';

export default function FleetTrackExportSettings({ onSettingsChange }) {
  const [settings, setSettings] = useState({
    defaultFormat: 'pdf',
    includeLogo: true,
    showAuditOverlay: true,
    filenameTemplate: 'FleetTrack_TripExport_{tripId}.pdf',
  });

  const handleChange = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    onSettingsChange?.(updated);
  };

  return (
    <div className="mt-10 border rounded-xl p-6 bg-white shadow-md space-y-6">
      <h1 className="text-2xl font-bold">⚙️ FleetTrack Export Settings</h1>

      {/* Format Default */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Default Export Format:</label>
        <select
          value={settings.defaultFormat}
          onChange={(e) => handleChange('defaultFormat', e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full"
        >
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
        </select>
      </div>

      {/* Branding Toggle */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.includeLogo}
          onChange={(e) => handleChange('includeLogo', e.target.checked)}
        />
        <label className="text-sm font-medium">Include FleetTrack Logo</label>
      </div>

      {/* Audit Overlay Toggle */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.showAuditOverlay}
          onChange={(e) => handleChange('showAuditOverlay', e.target.checked)}
        />
        <label className="text-sm font-medium">Show Diagnostic Overlay</label>
      </div>

      {/* Filename Template */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Filename Template:</label>
        <input
          type="text"
          value={settings.filenameTemplate}
          onChange={(e) => handleChange('filenameTemplate', e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full"
        />
        <p className="text-xs text-gray-500">
          Use <code>{'{tripId}'}</code> to insert trip ID dynamically.
        </p>
      </div>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-3 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Export Settings Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(settings, null, 2)}</pre>
      </details>
    </div>
  );
}