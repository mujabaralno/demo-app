"use client"
import { useState } from "react";

// Mock formatUSD function since it's imported from utils
const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Component InvoicePdf dengan Tailwind CSS yang kompatibel
const InvoicePdf = ({ results }) => {
  if (!results) {
    return (
      <div className="p-5 text-center text-gray-600">
        No invoice to display. Click "Calculate Estimate" first.
      </div>
    );
  }

  const c = results;

  return (
    <div 
      id="invoiceContent" 
      className="bg-white p-10 max-w-4xl mx-auto"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1.6' }}
    >
      {/* Header */}
      <div className="mb-8 pb-4" style={{ borderBottom: '2px solid #1f2937' }}>
        <h1 className="text-3xl font-bold text-gray-800">
          Invoice — {c.quoteNumber}
        </h1>
      </div>

      {/* Client & Job Info */}
      <div className="mb-8 gap-10 grid grid-cols-1 md:grid-cols-2">
        <div>
          <h3 className="text-gray-800 mb-4 text-lg font-semibold">Client Information</h3>
          <div className="text-sm space-y-2">
            <p className="text-gray-800">
              <span className="font-medium">Client:</span> {c.clientName}
            </p>
            <p className="text-gray-800">
              <span className="font-medium">Job Type:</span> {c.jobType}
            </p>
            <p className="text-gray-800">
              <span className="font-medium">Quantity:</span> {c.itemsNeeded.toLocaleString()} items
            </p>
            <p className="text-gray-800">
              <span className="font-medium">Item Size:</span> {c.itemL.toFixed(1)}cm × {c.itemW.toFixed(1)}cm
            </p>
            <p className="text-gray-800">
              <span className="font-medium">Paper Type:</span> {c.paperType} ({c.sheetL}cm × {c.sheetW}cm)
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-gray-800 mb-4 text-lg font-semibold">Production Details</h3>
          <div className="text-sm space-y-2">
            <p className="text-gray-800">
              <span className="font-medium">Items/Sheet:</span> {c.itemsPerSheet}
            </p>
            <p className="text-gray-800">
              <span className="font-medium">Total Sheets:</span> {c.totalSheets}
            </p>
            <p className="text-gray-800">
              <span className="font-medium">Production Time:</span> {c.prodRes.hours}h ({c.prodRes.days} days)
            </p>
            <p className="text-gray-800">
              <span className="font-medium">Estimated Delivery:</span> {c.prodRes.delivery}
            </p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Table */}
      <div className="mt-8">
        <h3 className="text-gray-800 mb-4 text-lg font-semibold">Cost Breakdown</h3>
        
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-3/4" style={{ borderRight: '1px solid #d1d5db' }}>
                  Description
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 w-1/4">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Base Production */}
              <tr className="hover:bg-gray-50" style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td className="px-4 py-3 text-sm text-gray-700" style={{ borderRight: '1px solid #e5e7eb' }}>
                  Base Production
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {formatUSD(c.costBreakdown.baseCost)}
                </td>
              </tr>

              {/* Additional Services */}
              {Object.entries(c.costBreakdown.additions).map(([addName, addCost]) => (
                <tr key={addName} className="hover:bg-gray-50" style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td className="px-4 py-3 text-sm text-gray-700" style={{ borderRight: '1px solid #e5e7eb' }}>
                    {addName}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatUSD(addCost)}
                  </td>
                </tr>
              ))}

              {/* Rush Surcharge */}
              {c.costBreakdown.rushSurcharge > 0 && (
                <tr style={{ backgroundColor: '#fefce8', borderBottom: '1px solid #e5e7eb' }}>
                  <td className="px-4 py-3 text-sm text-gray-700" style={{ borderRight: '1px solid #e5e7eb' }}>
                    Rush Surcharge
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatUSD(c.costBreakdown.rushSurcharge)}
                  </td>
                </tr>
              )}

              {/* Total */}
              <tr style={{ backgroundColor: '#dcfce7' }}>
                <td className="px-4 py-4 text-base font-bold text-gray-900" style={{ borderRight: '1px solid #e5e7eb' }}>
                  Total Due:
                </td>
                <td className="px-4 py-4 text-right text-lg font-bold" style={{ color: '#15803d' }}>
                  {formatUSD(c.costBreakdown.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 pt-5 text-center text-xs text-gray-500" style={{ borderTop: '1px solid #e5e7eb' }}>
        <p>
          Thank you for your business! Please contact us if you have any questions.
        </p>
      </div>
    </div>
  );
};

// Main BillingPanel Component
export default function BillingPanel({ results }) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data untuk testing jika results tidak ada
  const mockResults = {
    quoteNumber: "Q-2024-001",
    clientName: "ABC Company",
    jobType: "Business Cards",
    itemsNeeded: 1000,
    itemL: 8.5,
    itemW: 5.5,
    paperType: "Premium Cardstock",
    sheetL: 32,
    sheetW: 45,
    itemsPerSheet: 12,
    totalSheets: 84,
    prodRes: {
      hours: 8,
      days: 2,
      delivery: "2024-06-06"
    },
    costBreakdown: {
      baseCost: 150.00,
      additions: {
        "UV Coating": 25.00,
        "Die Cutting": 15.00
      },
      rushSurcharge: 20.00,
      total: 210.00
    }
  };

  // Function to generate and download HTML as PDF (using browser's print to PDF)
  const downloadInvoicePDF = () => {
    const dataToUse = results || mockResults;
    
    if (!dataToUse) {
      alert("No invoice to download. Calculate estimate first.");
      return;
    }

    setIsGenerating(true);

    try {
      // Create a new window with the invoice content
      const printWindow = window.open('', '_blank');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${dataToUse.quoteNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              padding: 20px;
            }
            
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            
            .header {
              border-bottom: 2px solid #1f2937;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .header h1 {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 30px;
            }
            
            .info-section h3 {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 15px;
            }
            
            .info-section p {
              font-size: 14px;
              margin-bottom: 8px;
              color: #374151;
            }
            
            .info-section .label {
              font-weight: 500;
            }
            
            .cost-breakdown {
              margin-top: 30px;
            }
            
            .cost-breakdown h3 {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 15px;
            }
            
            .cost-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              overflow: hidden;
            }
            
            .cost-table th {
              background-color: #f9fafb;
              padding: 12px 16px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
              color: #374151;
              border-bottom: 1px solid #d1d5db;
            }
            
            .cost-table th:first-child {
              border-right: 1px solid #d1d5db;
            }
            
            .cost-table th:last-child {
              text-align: right;
            }
            
            .cost-table td {
              padding: 12px 16px;
              font-size: 14px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .cost-table td:first-child {
              border-right: 1px solid #e5e7eb;
              color: #374151;
            }
            
            .cost-table td:last-child {
              text-align: right;
              font-weight: 500;
              color: #111827;
            }
            
            .rush-row {
              background-color: #fefce8;
            }
            
            .total-row {
              background-color: #dcfce7;
            }
            
            .total-row td {
              padding: 16px;
              font-size: 16px;
              font-weight: bold;
            }
            
            .total-row td:last-child {
              color: #15803d;
              font-size: 18px;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
            
            @media print {
              body {
                padding: 0;
              }
              
              .invoice-container {
                max-width: none;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1>Invoice — ${dataToUse.quoteNumber}</h1>
            </div>
            
            <div class="info-grid">
              <div class="info-section">
                <h3>Client Information</h3>
                <p><span class="label">Client:</span> ${dataToUse.clientName}</p>
                <p><span class="label">Job Type:</span> ${dataToUse.jobType}</p>
                <p><span class="label">Quantity:</span> ${dataToUse.itemsNeeded.toLocaleString()} items</p>
                <p><span class="label">Item Size:</span> ${dataToUse.itemL.toFixed(1)}cm × ${dataToUse.itemW.toFixed(1)}cm</p>
                <p><span class="label">Paper Type:</span> ${dataToUse.paperType} (${dataToUse.sheetL}cm × ${dataToUse.sheetW}cm)</p>
              </div>
              
              <div class="info-section">
                <h3>Production Details</h3>
                <p><span class="label">Items/Sheet:</span> ${dataToUse.itemsPerSheet}</p>
                <p><span class="label">Total Sheets:</span> ${dataToUse.totalSheets}</p>
                <p><span class="label">Production Time:</span> ${dataToUse.prodRes.hours}h (${dataToUse.prodRes.days} days)</p>
                <p><span class="label">Estimated Delivery:</span> ${dataToUse.prodRes.delivery}</p>
              </div>
            </div>
            
            <div class="cost-breakdown">
              <h3>Cost Breakdown</h3>
              <table class="cost-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Base Production</td>
                    <td>${formatUSD(dataToUse.costBreakdown.baseCost)}</td>
                  </tr>
                  ${Object.entries(dataToUse.costBreakdown.additions).map(([name, cost]) => `
                    <tr>
                      <td>${name}</td>
                      <td>${formatUSD(cost)}</td>
                    </tr>
                  `).join('')}
                  ${dataToUse.costBreakdown.rushSurcharge > 0 ? `
                    <tr class="rush-row">
                      <td>Rush Surcharge</td>
                      <td>${formatUSD(dataToUse.costBreakdown.rushSurcharge)}</td>
                    </tr>
                  ` : ''}
                  <tr class="total-row">
                    <td>Total Due:</td>
                    <td>${formatUSD(dataToUse.costBreakdown.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="footer">
              <p>Thank you for your business! Please contact us if you have any questions.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print dialog
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        // Close the window after printing
        setTimeout(() => {
          printWindow.close();
          setIsGenerating(false);
        }, 1000);
      }, 500);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      setIsGenerating(false);
    }
  };

  // Alternative function to download as HTML file
  const downloadInvoiceHTML = () => {
    const dataToUse = results || mockResults;
    
    if (!dataToUse) {
      alert("No invoice to download. Calculate estimate first.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${dataToUse.quoteNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; background: white; padding: 20px; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; }
          .header { border-bottom: 2px solid #1f2937; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { font-size: 28px; font-weight: bold; color: #1f2937; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
          .info-section h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 15px; }
          .info-section p { font-size: 14px; margin-bottom: 8px; color: #374151; }
          .info-section .label { font-weight: 500; }
          .cost-breakdown { margin-top: 30px; }
          .cost-breakdown h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 15px; }
          .cost-table { width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; }
          .cost-table th { background-color: #f9fafb; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px; color: #374151; border-bottom: 1px solid #d1d5db; }
          .cost-table th:first-child { border-right: 1px solid #d1d5db; }
          .cost-table th:last-child { text-align: right; }
          .cost-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
          .cost-table td:first-child { border-right: 1px solid #e5e7eb; color: #374151; }
          .cost-table td:last-child { text-align: right; font-weight: 500; color: #111827; }
          .rush-row { background-color: #fefce8; }
          .total-row { background-color: #dcfce7; }
          .total-row td { padding: 16px; font-size: 16px; font-weight: bold; }
          .total-row td:last-child { color: #15803d; font-size: 18px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <h1>Invoice — ${dataToUse.quoteNumber}</h1>
          </div>
          <div class="info-grid">
            <div class="info-section">
              <h3>Client Information</h3>
              <p><span class="label">Client:</span> ${dataToUse.clientName}</p>
              <p><span class="label">Job Type:</span> ${dataToUse.jobType}</p>
              <p><span class="label">Quantity:</span> ${dataToUse.itemsNeeded.toLocaleString()} items</p>
              <p><span class="label">Item Size:</span> ${dataToUse.itemL.toFixed(1)}cm × ${dataToUse.itemW.toFixed(1)}cm</p>
              <p><span class="label">Paper Type:</span> ${dataToUse.paperType} (${dataToUse.sheetL}cm × ${dataToUse.sheetW}cm)</p>
            </div>
            <div class="info-section">
              <h3>Production Details</h3>
              <p><span class="label">Items/Sheet:</span> ${dataToUse.itemsPerSheet}</p>
              <p><span class="label">Total Sheets:</span> ${dataToUse.totalSheets}</p>
              <p><span class="label">Production Time:</span> ${dataToUse.prodRes.hours}h (${dataToUse.prodRes.days} days)</p>
              <p><span class="label">Estimated Delivery:</span> ${dataToUse.prodRes.delivery}</p>
            </div>
          </div>
          <div class="cost-breakdown">
            <h3>Cost Breakdown</h3>
            <table class="cost-table">
              <thead>
                <tr><th>Description</th><th>Amount</th></tr>
              </thead>
              <tbody>
                <tr><td>Base Production</td><td>${formatUSD(dataToUse.costBreakdown.baseCost)}</td></tr>
                ${Object.entries(dataToUse.costBreakdown.additions).map(([name, cost]) => `
                  <tr><td>${name}</td><td>${formatUSD(cost)}</td></tr>
                `).join('')}
                ${dataToUse.costBreakdown.rushSurcharge > 0 ? `
                  <tr class="rush-row"><td>Rush Surcharge</td><td>${formatUSD(dataToUse.costBreakdown.rushSurcharge)}</td></tr>
                ` : ''}
                <tr class="total-row"><td>Total Due:</td><td>${formatUSD(dataToUse.costBreakdown.total)}</td></tr>
              </tbody>
            </table>
          </div>
          <div class="footer">
            <p>Thank you for your business! Please contact us if you have any questions.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataToUse.quoteNumber}_Invoice.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8" style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4 sm:mb-0">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Billing & Invoicing Dashboard
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          
          <button
            onClick={downloadInvoicePDF}
            disabled={isGenerating}
            className={`
              flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white
              transition-all duration-200 ${
              isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'btn btn-primary'
              }
            `}
            style={{ 
              boxShadow: isGenerating ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Opening Print Dialog...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print/Save as PDF
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <InvoicePdf results={results} />
      </div>
    </div>
  );
}