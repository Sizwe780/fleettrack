import React from 'react';
import './Logsheet.css';

const TripAnomalyScanner = ({ trip }) => {
  const {
    stops = [],
    deviationDetected,
    deviationReason,
    driverFlags = [],
    metadataFlags = []
  } = trip;

  const idleThreshold = 60; // minutes
  const idleAlerts = stops
    .filter(stop => stop.duration > idleThreshold)
    .map(stop => `Idle > ${idleThreshold} min at ${stop.location} (${stop.duration} min)`);

  return (
    <section className="logsheet-section">
      <h2>Trip Anomaly Scanner</h2>

      <ul>
        {idleAlerts.length > 0 && (
          <>
            <li><strong>Idle Time Alerts:</strong></li>
            {idleAlerts.map((alert, i) => (
              <li key={i} style={{ marginLeft: '20px' }}>🕒 {alert}</li>
            ))}
          </>
        )}

        {deviationDetected && (
          <li><strong>Route Deviation:</strong> ⚠️ {deviationReason || 'Unplanned detour'}</li>
        )}

        {driverFlags.length > 0 && (
          <>
            <li><strong>Driver Behavior Flags:</strong></li>
            {driverFlags.map((flag, i) => (
              <li key={i} style={{ marginLeft: '20px' }}>🚩 {flag}</li>
            ))}
          </>
        )}

        {metadataFlags.length > 0 && (
          <>
            <li><strong>Metadata Issues:</strong></li>
            {metadataFlags.map((flag, i) => (
              <li key={i} style={{ marginLeft: '20px' }}>❗ {flag}</li>
            ))}
          </>
        )}

        {idleAlerts.length === 0 && !deviationDetected && driverFlags.length === 0 && metadataFlags.length === 0 && (
          <li>✅ No anomalies detected</li>
        )}
      </ul>
    </section>
  );
};

export default TripAnomalyScanner;