import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const exportAsPDF = async (elementRef, filename = "FleetTrack_Document.pdf") => {
  const canvas = await html2canvas(elementRef.current, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgProps = pdf.getImageProperties(imgData);
  const ratio = imgProps.width / imgProps.height;
  const imgHeight = pageWidth / ratio;

  pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
  pdf.save(filename);
};