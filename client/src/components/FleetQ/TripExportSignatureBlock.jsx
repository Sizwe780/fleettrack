import React from "react";

export default function TripExportSignatureBlock({ trip }) {
  const hash = trip.signature?.hash || "—";
  const signer = trip.signature?.signedBy || "Unknown";

  return (
    <section className="mt-6 bg-white p-4 rounded border border-indigo-200 shadow-sm">
      <h3 className="text-sm font-semibold text-indigo-700 mb-2">🔐 Trip Signature</h3>
      <p className="text-xs text-gray-600">Signed by: <strong>{signer}</strong></p>
      <p className="text-xs text-gray-600">Hash: <code className="text-indigo-600">{hash}</code></p>
    </section>
  );
}