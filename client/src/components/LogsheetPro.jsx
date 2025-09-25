import React from 'react';
import QRCode from 'react-qr-code';
import './Logsheet.css';
import LiveTripMap from './LiveTripMap';

const TripLogsheetPro = ({ trip }) => {
  const {
    tripId, origin, destination, driverName, vehicleId,
    startTime, endTime, duration, routeSummary,
    stops, remarks, status, exportedAt, audit_hash,
    tripPath, driverSignature, signedAt, breachDetected, progress, incidents
  } = trip;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  return (
    <div className="logsheet-container">
      <header className="logsheet-header">
        <img src="/logo.png" alt="Company Logo" className="logsheet-logo" />
        <h1>Trip Logsheet</h1>
        <p><strong>Trip ID:</strong> {tripId || '—'}</p>
      </header>

      {breachDetected && (
        <div className="sla-breach">
          ⚠️ SLA Breach Detected — Trip exceeded allowed duration
        </div>
      )}

      <section className="logsheet-section">
        <h2>Trip Metadata</h2>
        <ul>
          <li><strong>Origin:</strong> {origin || '—'}</li>
          <li><strong>Destination:</strong> {destination || '—'}</li>
          <li><strong>Driver:</strong> {driverName || '—'}</li>
          <li><strong>Vehicle:</strong> {vehicleId || '—'}</li>
          <li><strong>Start Time:</strong> {formatDate(startTime)}</li>
          <li><strong>End Time:</strong> {formatDate(endTime)}</li>
          <li><strong>Duration:</strong> {duration ? `${duration.toFixed(2)} hrs` : '—'}</li>
          <li><strong>Status:</strong> {status || '—'}</li>
        </ul>
      </section>

      <section className="logsheet-section">
        <h2>Route Summary</h2>
        <p>{routeSummary?.trim() || '—'}</p>
      </section>

      <section className="logsheet-section">
        <h2>Stops & Remarks</h2>
        <ul>
          {stops?.length > 0 ? stops.map((stop, idx) => (
            <li key={idx}>
              <strong>{stop.location || 'Unknown Stop'}</strong> @ {formatDate(stop.timestamp)} — {remarks?.[idx] || stop.remark || 'No remark'}
            </li>
          )) : <li>No stops recorded.</li>}
        </ul>
      </section>

      <section className="logsheet-section">
        <h2>Trip Route Map</h2>
        <LiveTripMap tripId={tripId} />
      </section>

      <section className="logsheet-section">
        <h2>Trip Log Drawing</h2>
        <div className="log-drawing">
          <p><em>Visual trace of trip path and events (placeholder)</em></p>
        </div>
      </section>

      <section className="logsheet-section">
        <h2>Driver Signature</h2>
        <div className="signature-box">
          {driverSignature ? (
            <img src={driverSignature} alt="Driver Signature" style={{ maxHeight: '100px' }} />
          ) : (
            <p><em>Signature:</em> ____________________________</p>
          )}
          <p><em>Date:</em> {formatDate(signedAt || endTime)}</p>
        </div>
      </section>

      <footer className="logsheet-footer">
        <p><strong>Exported:</strong> {formatDate(exportedAt)}</p>
        {audit_hash && <p><strong>Audit Hash:</strong> {audit_hash}</p>}
        <QRCode value={`https://fleettrack.app/trip/${tripId}`} size={64} />
      </footer>

      <div className="audit-watermark">
        Exported: {formatDate(exportedAt)} | Hash: {audit_hash}
      </div>
    </div>
  );
};

export default TripLogsheetPro;