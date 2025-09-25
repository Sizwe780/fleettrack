import React, { useRef } from "react";

export default function TripLogsheetViewer({ trip }) {
  const printRef = useRef();

  if (!trip) return <p className="text-center mt-10">No trip selected.</p>;

  const startTime = new Date(trip.timestamp?.seconds * 1000).toLocaleString();
  const duration = trip.analysis?.duration || "N/A";
  const summary = trip.analysis?.routeData?.summary || "—";

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Trip LogSheet</title>
          <style>
            body {
              font-family: sans-serif;
              padding: 20px;
              line-height: 1.6;
            }
            h2 {
              font-size: 20px;
              margin-bottom: 16px;
            }
            p {
              margin: 6px 0;
            }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl mx-auto">
      <div ref={printRef}>
        <h2 className="text-lg font-bold mb-4">📝 Trip LogSheet</h2>
        <div className="text-sm space-y-2">
          <p><strong>Origin:</strong> {trip.origin}</p>
          <p><strong>Destination:</strong> {trip.destination}</p>
          <p><strong>Driver:</strong> {trip.driver_uid}</p>
          <p><strong>Start Time:</strong> {startTime}</p>
          <p><strong>Duration:</strong> {duration} mins</p>
          <p><strong>Route Summary:</strong> {summary}</p>
        </div>
      </div>
      <button
        onClick={handlePrint}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Print LogSheet
      </button>
    </div>
  );
}