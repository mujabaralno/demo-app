// components/pdfUtils.js
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export function exportEstimatePdf(calculation) {
  const invoiceEl = document.getElementById('invoiceContent');
  if (!invoiceEl) {
    alert('No invoice to download.');
    return;
  }
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.html(invoiceEl, {
    callback: (pdf) => {
      pdf.save(`${calculation.quoteNumber}_Invoice.pdf`);
    },
    margin: [40, 40, 40, 40],
    html2canvas: { scale: 0.8 }
  });
}
