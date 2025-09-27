import React from "react";

export default function ReceiptViewer({ receipt }) {
  const { receiptId, paidBy, amount, method, timestamp, remarks } = receipt;

  return (
    <div className="p-6 bg-white rounded-xl shadow max-w-2xl mx-auto border border-gray-200">
      <img src="https://fleettrack.app/assets/logo.png" alt="FleetTrack ∞ Logo" className="h-12 mb-4" />
      <h2 className="text-xl font-bold mb-2">🧾 Payment Receipt</h2>
      <p className="text-sm text-gray-600 mb-4">Receipt ID: {receiptId}</p>

      <div className="text-sm space-y-2">
        <p><strong>Paid By:</strong> {paidBy}</p>
        <p><strong>Amount:</strong> R{amount.toFixed(2)}</p>
        <p><strong>Method:</strong> {method}</p>
        <p><strong>Timestamp:</strong> {new Date(timestamp).toLocaleString()}</p>
        <p><strong>Remarks:</strong> {remarks || "—"}</p>
      </div>
    </div>
  );
}