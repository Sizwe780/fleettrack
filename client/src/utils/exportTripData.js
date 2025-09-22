// utils/exportTripData.js
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportTrips = (trips) => {
  const doc = new jsPDF();
  const rows = trips.map(t => [
    t.driver_name,
    t.origin,
    t.destination,
    new Date(t.date).toLocaleDateString('en-ZA'),
    t.analysis?.profitability?.netProfit ?? 0,
    t.analysis?.ifta?.fuelUsed ?? 0
  ]);

  doc.autoTable({
    head: [['Driver', 'Origin', 'Destination', 'Date', 'Profit (R)', 'Fuel (L)']],
    body: rows
  });

  doc.save('fleettrack-trips.pdf');
};