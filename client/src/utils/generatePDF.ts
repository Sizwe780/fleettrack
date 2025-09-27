import jsPDF from 'jspdf';

export function generatePDF({ title, certId, logoUrl, remarks, content }: {
  title: string,
  certId: string,
  logoUrl: string,
  remarks: string,
  content: any
}) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 20, 20);
  doc.setFontSize(10);
  doc.text(`Cert ID: ${certId}`, 20, 30);
  doc.text(`Remarks: ${remarks}`, 20, 40);
  doc.text(`Generated: ${new Date().toISOString()}`, 20, 50);

  let y = 60;
  Object.entries(content).forEach(([key, value]) => {
    doc.text(`${key}: ${JSON.stringify(value)}`, 20, y);
    y += 10;
  });

  if (logoUrl) {
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
      doc.addImage(img, 'PNG', 150, 10, 40, 20);
      doc.save(`${title.replace(/\s+/g, '_')}_${certId}.pdf`);
    };
  } else {
    doc.save(`${title.replace(/\s+/g, '_')}_${certId}.pdf`);
  }
}