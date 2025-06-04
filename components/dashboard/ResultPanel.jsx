"use client"
import { useEffect, useState } from "react";

import { paperSizes } from "@/constants";
import { formatUSD } from "@/lib/utils";
import { calculateCost } from "@/hooks/CalculateCost";
import {
  calculateMaxItemsPerSheet,
  calculateMaterialEfficiency,
} from "@/hooks";

export default function ResultsPanel({ results, onSaveQuote, onExportPDF, onEmailQuote }) {
  const [costBreakdownHTML, setCostBreakdownHTML] = useState("");
  const [recommendationsHTML, setRecommendationsHTML] = useState("");

  useEffect(() => {
    if (!results) {
      setCostBreakdownHTML("");
      setRecommendationsHTML("");
      return;
    }

    // 1) Build Detailed Cost Breakdown
    const cb = results.costBreakdown;
    let breakdown = `
    <div class="card p-4">
      <h4 class="font-semibold text-gray-800 mb-2">💰 Detailed Cost Breakdown</h4>
      <div class="space-y-2">
        <div class="flex justify-between ">
          <span className="text-black">Base Production Cost:</span>
          <span class="font-medium">${formatUSD(cb.baseCost)}</span>
        </div>
    `;
    for (let [addName, addCost] of Object.entries(cb.additions)) {
      breakdown += `
        <div class="flex justify-between">
          <span>${addName}:</span>
          <span class="font-medium">${formatUSD(addCost)}</span>
        </div>
      `;
    }
    if (cb.rushSurcharge > 0) {
      breakdown += `
        <div class="flex justify-between bg-yellow-50 p-2 rounded">
          <span>Rush Surcharge:</span>
          <span class="font-medium">${formatUSD(cb.rushSurcharge)}</span>
        </div>
      `;
    }
    breakdown += `
        <hr class="my-2" />
        <div class="flex justify-between font-bold text-lg">
          <span>Total Estimate:</span>
          <span class="text-green-700">${formatUSD(cb.total)}</span>
        </div>
      </div>
    </div>
    `;
    setCostBreakdownHTML(breakdown);

    // 2) Build Smart Suggestions & Quantity vs Cost table
    const baseL = results.itemL;
    const baseW = results.itemW;
    const sheetL = results.sheetL;
    const sheetW = results.sheetW;
    const currentIPS = results.itemsPerSheet;
    const currentEff = parseFloat(results.matEff.efficiency);

    // a) Size Optimization suggs (±0.3,0.2,0.1)
    const deltas = [-0.3, -0.2, -0.1, 0.1, 0.2, 0.3];
    let suggestions = [];
    deltas.forEach((delta) => {
      const candL = parseFloat((baseL + delta).toFixed(1));
      if (candL <= 0) return;
      const { count: candIPS } = calculateMaxItemsPerSheet(
        sheetL,
        sheetW,
        candL,
        baseW
      );
      if (candIPS > currentIPS) {
        const mat = calculateMaterialEfficiency(
          sheetL,
          sheetW,
          candL,
          baseW,
          candIPS
        );
        suggestions.push({
          length: candL,
          width: baseW,
          itemsPerSheet: candIPS,
          efficiency: parseFloat(mat.efficiency),
        });
      }
    });
    suggestions.sort((a, b) => {
      if (b.itemsPerSheet !== a.itemsPerSheet)
        return b.itemsPerSheet - a.itemsPerSheet;
      return b.efficiency - a.efficiency;
    });
    suggestions = suggestions.slice(0, 3);

    let recHTML = `<div class="mb-6">
      <h3 class="font-semibold text-gray-800 mb-3">📐 Size Optimization Suggestions</h3>`;
    if (suggestions.length === 0) {
      recHTML += `<p class="text-gray-600">No size suggestions improve efficiency over the current layout.</p>`;
    } else {
      suggestions.forEach((s) => {
        const deltaIPS = s.itemsPerSheet - currentIPS;
        const deltaEff = (s.efficiency - currentEff).toFixed(1);
        recHTML += `
        <div class="suggestion-card flex justify-between items-center">
          <div>
            <div class="font-semibold text-blue-700">${s.length}cm × ${s.width}cm</div>
            <div class="text-gray-600 text-sm">+${deltaIPS} items/sheet, +${deltaEff}% efficiency</div>
          </div>
          <button 
            class="px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-800"
            onclick="applySizeSuggestion(${s.length}, ${s.width})"
          >
            Apply
          </button>
        </div>
        `;
      });
    }
    recHTML += `</div> `;

    // b) Quantity vs Cost Analysis
    const itemsNeeded = results.itemsNeeded;
    const currentCostPerItem = results.costBreakdown.total / itemsNeeded;
    let qtys = [
      Math.max(1, Math.round(itemsNeeded / 2)),
      itemsNeeded,
      Math.round(itemsNeeded * 1.5),
      itemsNeeded * 2,
      itemsNeeded * 3,
    ];
    qtys = Array.from(new Set(qtys)).sort((a, b) => a - b);

    let bestRec = null;
    qtys.forEach((qty) => {
      const { count: candIPS } = calculateMaxItemsPerSheet(
        sheetL,
        sheetW,
        baseL,
        baseW
      );
      const sheetsForQty = Math.ceil(qty / candIPS);
      const costResQty = calculateCost(
        sheetsForQty,
        results.printSides,
        results.rushOrder,
        paperSizes[results.paperType].costMultiplier,
        {
          folding: results.additionsFlags?.folding,
          numFoldLines: results.additionsFlags?.numFoldLines,
          foiling: results.additionsFlags?.foiling,
          embossing: results.additionsFlags?.embossing,
          uvPrinting: results.additionsFlags?.uvPrinting,
          lamination: results.additionsFlags?.lamination,
          dieCutting: results.additionsFlags?.dieCutting,
        }
      );
      const cpu = costResQty.total / qty;
      if (!bestRec || cpu < bestRec.cpu) bestRec = { qty, cpu };
    });

    recHTML += `
      <div>
        <h3 class="font-semibold text-gray-800 mb-3">📈 Quantity vs Cost Analysis</h3>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Quantity</th>
                <th>Total Cost</th>
                <th>Cost Per Item</th>
                <th>Savings vs Current</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
    `;
    qtys.forEach((qty) => {
      const { count: candIPS } = calculateMaxItemsPerSheet(
        sheetL,
        sheetW,
        baseL,
        baseW
      );
      const sheetsForQty = Math.ceil(qty / candIPS);
      const costResQty = calculateCost(
        sheetsForQty,
        results.printSides,
        results.rushOrder,
        paperSizes[results.paperType].costMultiplier,
        {
          folding: results.additionsFlags?.folding,
          numFoldLines: results.additionsFlags?.numFoldLines,
          foiling: results.additionsFlags?.foiling,
          embossing: results.additionsFlags?.embossing,
          uvPrinting: results.additionsFlags?.uvPrinting,
          lamination: results.additionsFlags?.lamination,
          dieCutting: results.additionsFlags?.dieCutting,
        }
      );
      const totalCostQty = costResQty.total;
      const cpuQty = totalCostQty / qty;
      const savingsPct = (
        ((currentCostPerItem - cpuQty) / currentCostPerItem) *
        100
      ).toFixed(1);
      const savingsColored =
        parseFloat(savingsPct) > 0
          ? `<span class="text-green-600">+${savingsPct}%</span>`
          : parseFloat(savingsPct) < 0
          ? `<span class="text-red-600">${savingsPct}%</span>`
          : `<span class="text-gray-700">0.0%</span>`;

      let badge = "";
      if (qty === itemsNeeded) {
        badge = `<span class="status-indicator status-active">Current</span>`;
      } else if (qty === bestRec.qty) {
        badge = `<span class="status-indicator status-completed">Recommended</span>`;
      }

      recHTML += `
        <tr>
          <td>${qty.toLocaleString()}</td>
          <td>${formatUSD(totalCostQty)}</td>
          <td>${cpuQty.toFixed(3)}</td>
          <td>${savingsColored}</td>
          <td>${badge}</td>
        </tr>
      `;
    });
    recHTML += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    setRecommendationsHTML(recHTML);
  }, [results]);

  // We’ll also attach a global helper to handle clicking “Apply” on a suggestion
  // (In Next.js, you might prefer to pass a real callback instead of using window.)
  useEffect(() => {
    window.applySizeSuggestion = (newL, newW) => {
      // Re‐run parent’s onCalculate with updated dims
      onSaveQuote({ ...results, itemL: newL, itemW: newW });
    };
  }, [results]);

  if (!results) {
    return null; // Don’t render anything if there’s no results yet
  }

  const cb = results.costBreakdown;
  const { itemsPerSheet, totalSheets, matEff, prodRes } = results;

  return (
    <div className="card p-6 mt-8">
      <div className="border-b pb-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          {/* Icon omitted for brevity */}
          Cost Estimation Results
        </h2>
      </div>

      {/* Total Cost Display */}
      <div className="flex flex-col items-center text-center bg-green-600 text-white rounded-lg p-6 relative overflow-hidden mb-6">
        <h3 className="text-3xl font-extrabold">{formatUSD(cb.total)}</h3>
        <p>
          <span>{formatUSD(cb.total / results.itemsNeeded)} per item</span>

        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="metric-card">
          <div className="metric-value">{itemsPerSheet}</div>
          <div className="metric-label">Items per Sheet</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalSheets}</div>
          <div className="metric-label">Total Sheets</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{matEff.efficiency}%</div>
          <div className="metric-label">Material Efficiency</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{prodRes.days}</div>
          <div className="metric-label">Production Days</div>
        </div>
      </div>

      {/* Detailed Cost Breakdown */}
      <div dangerouslySetInnerHTML={{ __html: costBreakdownHTML }} />

      {/* Smart Suggestions & Quantity vs Cost Table */}
      <div dangerouslySetInnerHTML={{ __html: recommendationsHTML }} />

      {/* Save / Export / Email Buttons */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onSaveQuote(results)}
          className="btn btn-success flex items-center justify-center"
        >
          Save Quote
        </button>
        <button
          onClick={() => onExportPDF(results)}
          className="btn btn-warning flex items-center justify-center"
        >
          Export PDF
        </button>
        <button
          onClick={() => onEmailQuote(results)}
          className="btn btn-secondary flex items-center justify-center"
        >
          Email Quote
        </button>
      </div>
    </div>
  );
}