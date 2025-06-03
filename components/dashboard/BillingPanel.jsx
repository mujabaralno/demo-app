"use client"
import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

import { formatUSD } from "@/lib/utils";

export default function BillingPanel({ results }) {
  const [invoiceHTML, setInvoiceHTML] = useState("");

  useEffect(() => {
    if (!results) {
      setInvoiceHTML(
        `<p class="text-gray-600">No invoice to display. Click “Calculate Estimate” first.</p>`
      );
      return;
    }

    // Build invoice HTML string
    const c = results;
    let html = `
      <div id="invoiceContent" class="space-y-4">
        <h3 class="text-xl font-bold text-gray-800">Invoice — ${c.quoteNumber}</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p><span class="font-semibold">Client:</span> ${c.clientName}</p>
            <p><span class="font-semibold">Job Type:</span> ${c.jobType}</p>
            <p><span class="font-semibold">Quantity:</span> ${c.itemsNeeded.toLocaleString()} items</p>
            <p><span class="font-semibold">Item Size:</span> ${c.itemL.toFixed(1)}cm × ${c.itemW.toFixed(1)}cm</p>
            <p><span class="font-semibold">Paper Type:</span> ${
              c.paperType
            } (${c.sheetL}cm × ${c.sheetW}cm)</p>
          </div>
          <div>
            <p><span class="font-semibold">Items/Sheet:</span> ${c.itemsPerSheet}</p>
            <p><span class="font-semibold">Total Sheets:</span> ${c.totalSheets}</p>
            <p><span class="font-semibold">Production Time:</span> ${c.prodRes.hours}h (${
      c.prodRes.days
    } days)</p>
            <p><span class="font-semibold">Estimated Delivery:</span> ${c.prodRes.delivery}</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full mt-4 border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="py-2 px-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th class="py-2 px-3 text-right text-sm font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b">
                <td class="py-2 px-3 text-gray-700">Base Production</td>
                <td class="py-2 px-3 text-right text-gray-800">${formatUSD(
                  c.costBreakdown.baseCost
                )}</td>
              </tr>
    `;
    for (let [addName, addCost] of Object.entries(c.costBreakdown.additions)) {
      html += `
              <tr class="border-b">
                <td class="py-2 px-3 text-gray-700">${addName}</td>
                <td class="py-2 px-3 text-right text-gray-800">${formatUSD(addCost)}</td>
              </tr>
      `;
    }
    if (c.costBreakdown.rushSurcharge > 0) {
      html += `
              <tr class="border-b bg-yellow-50">
                <td class="py-2 px-3 text-gray-700">Rush Surcharge</td>
                <td class="py-2 px-3 text-right text-gray-800">${formatUSD(
                  c.costBreakdown.rushSurcharge
                )}</td>
              </tr>
      `;
    }
    html += `
              <tr class="border-b bg-green-50">
                <td class="py-2 px-3 text-gray-700">Profit (35%)</td>
                <td class="py-2 px-3 text-right text-gray-800">${formatUSD(
                  c.costBreakdown.profit
                )}</td>
              </tr>
              <tr class="font-bold text-lg">
                <td class="py-2 px-3 text-gray-800">Total Due:</td>
                <td class="py-2 px-3 text-right text-green-700">${formatUSD(
                  c.costBreakdown.total
                )}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    setInvoiceHTML(html);
  }, [results]);

  function downloadInvoicePDF() {
    const element = document.getElementById("invoiceContent");
    if (!element) {
      alert("No invoice to download.");
      return;
    }
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    pdf.html(element, {
      callback: (doc) => {
        doc.save(`${results.quoteNumber}_Invoice.pdf`);
      },
      margin: [40, 40, 40, 40],
      html2canvas: { scale: 0.8 },
    });
  }

  return (
    <div className="card p-6 mt-8">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          {/* Icon omitted */}
          Billing & Invoicing Dashboard
        </h2>
        <button
          onClick={downloadInvoicePDF}
          className="btn btn-primary flex items-center justify-center"
        >
          Download Invoice PDF
        </button>
      </div>
      <div
        id="invoicePreview"
        className="p-4 border border-gray-200 rounded-lg"
        dangerouslySetInnerHTML={{ __html: invoiceHTML }}
      />
    </div>
  );
}
