import React from 'react';

const ApiPortal = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md border max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">FleetTrack API Portal</h2>
      <p className="text-gray-700 mb-6">
        Access real-time fleet data, trip analytics, and driver performance via secure endpoints.
        Perfect for integrations, dashboards, and third-party apps.
      </p>

      <div className="space-y-4 text-sm">
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">🔍 GET /api/trips</h3>
          <p>Returns all trips with metadata, scoring, and status.</p>
        </div>

        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">📊 GET /api/drivers/:id/performance</h3>
          <p>Returns driver stats, health score, and badge history.</p>
        </div>

        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">🚦 GET /api/fleet/health</h3>
          <p>Returns fleet-wide health metrics and flagged vehicles.</p>
        </div>

        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">🔐 POST /api/auth/token</h3>
          <p>Generates secure access token for authenticated requests.</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        All endpoints require bearer token authentication. Rate limits and scopes apply.
      </p>
    </div>
  );
};

export default ApiPortal;