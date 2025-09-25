import React from 'react';
import QRCode from 'react-qr-code';
import './Logsheet.css';
import LiveTripMap from './LiveTripMap';
import TripDiagnosticsPanel from './TripDiagnosticsPanel';
import TripRiskDashboard from './TripRiskDashboard';
import TripVersionViewer from './TripVersionViewer';
import TripExportEngine from './TripExportEngine';

const TripLogsheetPro = ({ trip }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  return (
    <div className="logsheet-container">
      <header className="logsheet-header">
        <img src="/logo.png" alt="Company Logo" className="logsheet-logo" />
        <h1>Trip Logsheet</h1>
        <p><strong>Trip ID:</strong> {trip.tripId || '—'}</p>
      </header>

      {trip.breachDetected && (
        <div className="sla-breach">
          ⚠️ SLA Breach Detected — Trip exceeded allowed duration
        </div>
      )}

      <section className="logsheet-section">
        <h2>Trip Metadata</h2>
        <ul>
          <li><strong>Origin:</strong> {trip.origin}</li>
          <li><strong>Destination:</strong> {trip.destination}</li>
          <li><strong>Driver:</strong> {trip.driverName}</li>
          <li><strong>Vehicle:</strong> {trip.vehicleId}</li>
          <li><strong>Start Time:</strong> {formatDate(trip.startTime)}</li>
          <li><strong>End Time:</strong> {formatDate(trip.endTime)}</li>
          <li><strong>Duration:</strong> {trip.duration?.toFixed(2)} hrs</li>
          <li><strong>Status:</strong> {trip.status}</li>
        </ul>
      </section>

      <section className="logsheet-section">
        <h2>Route Summary</h2>
        <p>{trip.routeSummary?.trim() || '—'}</p>
      </section>

      <section className="logsheet-section">
        <h2>Stops & Remarks</h2>
        <ul>
          {trip.stops?.map((stop, idx) => (
            <li key={idx}>
              <strong>{stop.location}</strong> @ {formatDate(stop.timestamp)} — {trip.remarks?.[idx] || stop.remark}
            </li>
          ))}
        </ul>
      </section>

      <LiveTripMap tripId={trip.tripId} />
      <TripDiagnosticsPanel trip={trip} />
      <TripRiskDashboard trips={[trip]} />
      <TripVersionViewer trip={trip} />

      <section className="logsheet-section">
        <h2>Driver Signature</h2>
        <div className="signature-box">
          {trip.driverSignature ? (
            <img src={trip.driverSignature} alt="Driver Signature" style={{ maxHeight: '100px' }} />
          ) : (
            <p><em>Signature:</em> ____________________________</p>
          )}
          <p><em>Date:</em> {formatDate(trip.signedAt || trip.endTime)}</p>
        </div>
      </section>

      <TripExportEngine trip={trip} />

      <footer className="logsheet-footer">
        <p><strong>Exported:</strong> {formatDate(trip.exportedAt)}</p>
        <p><strong>Audit Hash:</strong> {trip.audit_hash}</p>
        <QRCode value={`https://fleettrack.app/trip/${trip.tripId}`} size={64} />
      </footer>
    </div>
  );
};

export default TripLogsheetPro;