import React, { useRef, useState } from "react";
import { printDocument, generateDispatchCertificate } from "../firebase";

export default function TripLogsheetViewer({ trip, userId }) {
  const printRef = useRef();
  const [printedDoc, setPrintedDoc] = useState(null);
  const [cert, setCert] = useState(null);
  const [remarks, setRemarks] = useState("");

  if (!trip) return <p className="text-center mt-10">No trip selected.</p>;

  const startTime = new Date(trip.timestamp?.seconds * 1000).toLocaleString();
  const duration = trip.analysis?.duration || "N/A";
  const summary = trip.analysis?.routeData?.summary || "—";

  const handlePrint = async () => {
    const enrichedTrip = { ...trip, remarks };
    const payload = await printDocument(userId, "TripLogsheet", enrichedTrip);
    setPrintedDoc(payload);

    const certPayload = await generateDispatchCertificate(trip.id, userId, remarks);
    setCert(certPayload);

    const printContents = `
      <div style="font-family: serif; padding: 40px; line-height: 1.6;">
        <img src="${payload.logoUrl}" alt="FleetTrack ∞ Logo" style="height: 60px; margin-bottom: 20px;" />
        <h2 style="font-size: 22px; margin-bottom: 12px;">📝 Trip LogSheet</h2>
        <p><strong>Document ID:</strong> ${payload.docId}</p>
        <p><strong>Generated:</strong> ${payload.createdAt}</p>
        <p><strong>Author UID:</strong> ${userId}</p>
        <hr style="margin: 20px 0;" />
        <p><strong>Origin:</strong> ${trip.origin}</p>
        <p><strong>Destination:</strong> ${trip.destination}</p>
        <p><strong>Driver:</strong> ${trip.driver_uid}</p>
        <p><strong>Start Time:</strong> ${startTime}</p>
        <p><strong>Duration:</strong> ${duration} mins</p>
        <p><strong>Route Summary:</strong> ${summary}</p>
        <p><strong>Remarks:</strong> ${remarks || "—"}</p>
        <hr style="margin: 20px 0;" />
        <p><strong>Dispatch Certificate:</strong> ${certPayload?.certId || "—"}</p>
        <p><strong>Issued At:</strong> ${certPayload?.issuedAt || "—"}</p>
        <p><strong>Signed By:</strong> ${certPayload?.signedBy || "—"}</p>
      </div>
    `;

    const printWindow = window.open('', '', 'height=800,width=1000');
    printWindow.document.write(`<html><head><title>Trip LogSheet</title></head><body>${printContents}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-4">📝 Trip LogSheet</h2>
      <div className="text-sm space-y-2">
        <p><strong>Origin:</strong> {trip.origin}</p>
        <p><strong>Destination:</strong> {trip.destination}</p>
        <p><strong>Driver:</strong> {trip.driver_uid}</p>
        <p><strong>Start Time:</strong> {startTime}</p>
        <p><strong>Duration:</strong> {duration} mins</p>
        <p><strong>Route Summary:</strong> {summary}</p>
        <label className="block mt-4 text-sm font-medium text-gray-700">Remarks:</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm"
          placeholder="Enter driver or supervisor remarks..."
        />
      </div>

      <button
        onClick={handlePrint}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Print & Certify LogSheet
      </button>

      {printedDoc && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs">
          <p><strong>Document ID:</strong> {printedDoc.docId}</p>
          <p><strong>Generated:</strong> {printedDoc.createdAt}</p>
          <p><strong>Author UID:</strong> {printedDoc.uid}</p>
          <p><strong>Printed:</strong> ✅</p>
        </div>
      )}

      {cert && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-xs">
          <p><strong>Dispatch Certificate:</strong> {cert.certId}</p>
          <p><strong>Issued At:</strong> {cert.issuedAt}</p>
          <p><strong>Signed By:</strong> {cert.signedBy}</p>
        </div>
      )}
    </div>
  );
}