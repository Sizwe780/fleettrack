import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TripLogsheetExporter = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const ratio = canvas.width / canvas.height;
  const pdfHeight = pageWidth / ratio;

  pdf.addImage(imgData, 'PNG', 0, 10, pageWidth, pdfHeight);
  pdf.save(filename);
};

export default TripLogsheetExporter;