import React from 'react';
import './Logsheet.css';

const TripDiagnosticsPanel = ({ trip }) => {
  const {
    slaMinutes, duration,
    breachDetected, breachTime,
    stopDurations, deviationDetected,
    riskScore, fuelEstimate, delayPrediction,
    driverFlags
  } = trip;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  return (
    <section className="logsheet-section">
      <h2>Trip Diagnostics</h2>

      {breachDetected && (
        <div className="sla-breach">
          ⚠️ SLA Breach — Trip exceeded {slaMinutes} min SLA<br />
          Breach Time: {formatDate(breachTime)}
        </div>
      )}

      {deviationDetected && (
        <div className="sla-breach" style={{ borderLeftColor: '#f90', color: '#b36' }}>
          ⚠️ Route Deviation — Driver diverged from planned path
        </div>
      )}

      <ul>
        <li><strong>Actual Duration:</strong> {duration ? `${duration.toFixed(2)} hrs` : '—'}</li>
        <li><strong>Stop Analysis:</strong></li>
        {stopDurations?.length > 0 ? stopDurations.map((stop, i) => (
          <li key={i} style={{ marginLeft: '20px' }}>
            ⏱️ {stop.location}: {stop.duration} min
          </li>
        )) : <li style={{ marginLeft: '20px' }}>No stop data available</li>}

        <li><strong>Risk Score:</strong> {riskScore ?? '—'} / 10</li>
        <li><strong>Delay Prediction:</strong> {delayPrediction ?? '—'}</li>
        <li><strong>Fuel Estimate:</strong> {fuelEstimate ?? '—'}</li>

        {driverFlags?.length > 0 && (
          <>
            <li><strong>Driver Behavior Flags:</strong></li>
            {driverFlags.map((flag, i) => (
              <li key={i} style={{ marginLeft: '20px' }}>🚩 {flag}</li>
            ))}
          </>
        )}
      </ul>
    </section>
  );
};

export default TripDiagnosticsPanel;