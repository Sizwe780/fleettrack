import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportTripToPDF = (trip) => {
  const doc = new jsPDF();
  doc.text(`Trip Summary: ${trip.origin} → ${trip.destination}`, 10, 10);
  doc.autoTable({
    head: [['Metric', 'Value']],
    body: [
      ['Driver', trip.driver_name],
      ['Date', trip.date],
      ['Profit', `R${trip.analysis?.profitability?.netProfit}`],
      ['Fuel Used', `${trip.analysis?.ifta?.fuelUsed} L`],
    ],
  });
  doc.save(`FleetTrack_Trip_${trip.id}.pdf`);
};