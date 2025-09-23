import React, { useState } from 'react';
import FleetTrackExportSettings from './FleetTrackExportSettings';
import FleetTrackExportQueue from './FleetTrackExportQueue';
import FleetTrackExportHistory from './FleetTrackExportHistory';
import FleetTrackExportAnalytics from './FleetTrackExportAnalytics';
import FleetTrackExportLeaderboard from './FleetTrackExportLeaderboard';
import FleetTrackExportReport from './FleetTrackExportReport';
import FleetTrackExportReportEmail from './FleetTrackExportReportEmail';
import FleetTrackEmailLog from './FleetTrackEmailLog';
import FleetTrackEmailRetry from './FleetTrackEmailRetry';

export default function FleetTrackAdminDashboard({
  trips = [],
  exportHistory = [],
  emailDeliveryLogArray = [],
}) {
  const [settings, setSettings] = useState({});

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const filteredMonthlyHistory = exportHistory.filter(
    entry => new Date(entry.timestamp).getMonth() === new Date().getMonth()
  );

  const failedDeliveries = emailDeliveryLogArray.filter(e => e.status === 'failed');

  return (
    <div className="space-y-10 p-6 bg-gray-50">
      <h1 className="text-3xl font-bold">🛠️ FleetTrack Admin Dashboard</h1>

      {/* 📫 Email Delivery Log */}
      <FleetTrackEmailLog log={emailDeliveryLogArray} />

      {/* 🔁 Retry Failed Email Deliveries */}
      <FleetTrackEmailRetry failedLog={failedDeliveries} />

      {/* ⚙️ Export Settings */}
      <FleetTrackExportSettings onSettingsChange={setSettings} />

      {/* 📦 Export Queue */}
      <FleetTrackExportQueue trips={trips} />

      {/* 📜 Export History */}
      <FleetTrackExportHistory history={exportHistory} />

      {/* 📈 Export Analytics */}
      <FleetTrackExportAnalytics history={exportHistory} />

      {/* 🏆 Export Leaderboard */}
      <FleetTrackExportLeaderboard history={exportHistory} />

      {/* 🗓️ Monthly Export Report */}
      <FleetTrackExportReport history={exportHistory} />

      {/* 📬 Scheduled Export Report Email */}
      <FleetTrackExportReportEmail
        history={filteredMonthlyHistory}
        month={currentMonth}
      />

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-100 p-3 rounded text-xs mt-4">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Admin Dashboard Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify({ settings }, null, 2)}</pre>
      </details>
    </div>
  );
}