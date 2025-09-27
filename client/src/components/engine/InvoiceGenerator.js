import React from "react";

export default function InvoiceGenerator({ invoice }) {
  const { invoiceId, issuedTo, items, total, taxId, dueDate, remarks } = invoice;

  return (
    <div className="p-6 bg-white rounded-xl shadow max-w-3xl mx-auto border border-gray-200">
      <img src="https://fleettrack.app/assets/logo.png" alt="FleetTrack ∞ Logo" className="h-12 mb-4" />
      <h2 className="text-xl font-bold mb-2">🧮 Invoice</h2>
      <p className="text-sm text-gray-600 mb-4">Document ID: {invoiceId}</p>

      <div className="text-sm space-y-2">
        <p><strong>Issued To:</strong> {issuedTo}</p>
        <p><strong>Tax ID:</strong> {taxId}</p>
        <p><strong>Due Date:</strong> {dueDate}</p>
        <hr className="my-4" />
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 text-left">Item</th>
              <th className="px-2 py-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="px-2 py-1">{item.label}</td>
                <td className="px-2 py-1 text-right">R{item.amount.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="border-t font-bold">
              <td className="px-2 py-1">Total</td>
              <td className="px-2 py-1 text-right">R{total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4"><strong>Remarks:</strong> {remarks || "—"}</p>
      </div>
    </div>
  );
}