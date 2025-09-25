import React from 'react';
import QRCode from 'react-qr-code';
import './Logsheet.css';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';

const TripLogsheetPro = ({ trip }) => {
  const {
    tripId, origin, destination, driverName, vehicleId,
    startTime, endTime, duration, routeSummary,
    stops, remarks, status, exportedAt, audit_hash,
    tripPath, driverSignature, signedAt
  } = trip;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  return (
    <div className="logsheet-container">
      {/* Header */}
      <header className="logsheet-header">
        <img src="/logo.png" alt="Company Logo" className="logsheet-logo" />
        <h1>Trip Logsheet</h1>
        <p><strong>Trip ID:</strong> {tripId || '—'}</p>
      </header>

      {/* Metadata */}
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

      {/* Route Summary */}
      <section className="logsheet-section">
        <h2>Route Summary</h2>
        <p>{routeSummary?.trim() || '—'}</p>
      </section>

      {/* Stops & Remarks */}
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

      {/* Trip Map */}
      {tripPath?.length > 1 && (
        <section className="logsheet-section">
          <h2>Trip Route Map</h2>
          <MapContainer center={[tripPath[0].lat, tripPath[0].lng]} zoom={6} scrollWheelZoom={false} style={{ height: '300px', borderRadius: '8px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Polyline positions={tripPath.map(p => [p.lat, p.lng])} color="blue" />
            {stops?.map((stop, i) => (
              <Marker key={i} position={[stop.lat, stop.lng]}>
                <Popup>
                  <strong>{stop.location}</strong><br />
                  {stop.remark}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </section>
      )}

      {/* Signature */}
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

      {/* Footer */}
      <footer className="logsheet-footer">
        <p><strong>Exported:</strong> {formatDate(exportedAt)}</p>
        {audit_hash && <p><strong>Audit Hash:</strong> {audit_hash}</p>}
        <QRCode value={`https://fleettrack.app/trip/${tripId}`} size={64} />
      </footer>
    </div>
  );
};

export default TripLogsheetPro;