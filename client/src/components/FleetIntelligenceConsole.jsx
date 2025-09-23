import React, { useEffect, useState } from 'react';
import TripReplayViewer from './DriverConsole/TripReplayViewer';
import ModuleStatusBoard from './AdminConsole/ModuleStatusBoard';
import ComplianceScoreChart from './Analytics/ComplianceScoreChart';
import IncidentHeatmap from './Analytics/IncidentHeatmap';

export default function FleetIntelligenceConsole() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch('/api/fleet-summary')
      .then(res => res.json())
      .then(data => setSummary(data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold">🧠 Fleet Intelligence Console</h2>

      {summary && (
        <div className="bg-gray-100 p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">📊 Weekly Summary</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Total Trips: {summary.totalTrips}</li>
            <li>Incident Rate: {summary.incidentRate}%</li>
            <li>Avg Compliance Score: {summary.avgCompliance}</li>
            <li>Top Driver: {summary.topDriver}</li>
          </ul>
        </div>
      )}

      <ComplianceScoreChart />
      <IncidentHeatmap />
      <ModuleStatusBoard />
      <TripReplayViewer />
    </div>
  );
}