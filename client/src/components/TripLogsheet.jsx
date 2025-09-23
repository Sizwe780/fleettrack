import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function TripLogsheet({ trip }) {
  if (!trip) return null;

  const exportPDF = () => {
    const element = document.getElementById('logsheet');
    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10);
      pdf.save(`trip-${trip.tripId || 'logsheet'}.pdf`);
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🧾 Trip Logsheet</h2>
        <button
          onClick={exportPDF}
          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
        >
          Export PDF
        </button>
      </div>

      <div id="logsheet">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Driver:</strong> {trip.driver_name}</div>
          <div><strong>Date:</strong> {trip.date ? new Date(trip.date).toLocaleDateString() : '—'}</div>
          <div><strong>Origin:</strong> {trip.origin}</div>
          <div><strong>Destination:</strong> {trip.destination}</div>
          <div><strong>Cycle Used:</strong> {trip.cycle_used} hrs</div>
          <div><strong>Departure Time:</strong> {trip.departure_time}</div>
          <div><strong>Health Score:</strong> {trip.healthScore}/100</div>
          <div><strong>Status:</strong> {trip.status}</div>
          {trip.flagReason && (
            <div className="col-span-2 text-red-600">
              <strong>⚠️ Flag Reason:</strong> {trip.flagReason}
            </div>
          )}
        </div>

        <div className="mt-4">
          <strong>Remarks:</strong>
          <ul className="list-disc ml-6 text-sm mt-2">
            {(trip.remarks || []).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-500">Driver Signature:</p>
          <div className="h-16 border-b border-gray-400 w-64 mt-2" />
        </div>
      </div>
    </div>
  );
}