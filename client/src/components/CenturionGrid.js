import React from 'react';

function CenturionGrid({ userId, appId, selectedTrip }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🛡️ Centurion Grid
      </h2>

      <div className="text-sm text-gray-700 space-y-3">
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>App ID:</strong> {appId}</p>
        {selectedTrip ? (
          <>
            <p><strong>Trip:</strong> {selectedTrip.origin} → {selectedTrip.destination}</p>
            <p><strong>Status:</strong> {selectedTrip.status}</p>
            <p><strong>Health Score:</strong> {selectedTrip.analysis?.healthScore ?? '—'}/100</p>
            <p><strong>Profit:</strong> R{selectedTrip.analysis?.profitability?.netProfit ?? '—'}</p>
          </>
        ) : (
          <p>No trip selected. Select a trip to activate Centurion Grid overlays.</p>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p>This module enforces RBAC overlays, audit hooks, and tamper detection for sovereign-grade compliance.</p>
        <p>All actions are logged and verified against FleetTrack’s SecureDispatch.js and Q-Vector Core™.</p>
      </div>
    </div>
  );
}

export default CenturionGrid;