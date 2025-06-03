"use client";
import { useState, useRef } from "react";
import Head from "next/head";
import EstimationForm from "@/components/dashboard/EstimationForm";
import ResultsPanel from "@/components/dashboard/ResultPanel";
import DiePatternCanvas from "@/components/dashboard/shared/DiePatternCanvas";
import Link from "next/link";

export default function Home() {
  // Current "results" object (null until user calculates)
  const [results, setResults] = useState(null);

  // Track next quote number
  const nextQuoteNumberRef = useRef(1);

  // Called by EstimationForm
  function handleCalculateEstimate(rawResults) {
    // Assign a new quoteNumber
    const quoteNumFormatted = `PE-${String(nextQuoteNumberRef.current).padStart(
      3,
      "0"
    )}`;
    nextQuoteNumberRef.current += 1;

    const fullResults = {
      ...rawResults,
      quoteNumber: quoteNumFormatted,
      paperType: rawResults.paperType || rawResults.paperType,
    };
    setResults(fullResults);

    // Save to localStorage for access in other pages
    localStorage.setItem("currentResults", JSON.stringify(fullResults));
  }

  // Called by ResultsPanel when user clicks "Save Quote"
  function handleSaveQuote(resultObj) {
    if (!resultObj) {
      alert("Please calculate an estimate first!");
      return;
    }
    const nowStr = new Date().toLocaleString();
    const newQuote = {
      id: Date.now(),
      quoteNumber: resultObj.quoteNumber,
      clientName: resultObj.clientName,
      jobType: resultObj.jobType,
      quantity: resultObj.itemsNeeded,
      totalCost: resultObj.costBreakdown.total,
      costPerItem: resultObj.costBreakdown.total / resultObj.itemsNeeded,
      itemsPerSheet: resultObj.itemsPerSheet,
      totalSheets: resultObj.totalSheets,
      efficiency: resultObj.matEff.efficiency,
      timestamp: nowStr,
      rushOrder: resultObj.rushOrder,
    };

    // Save to localStorage
    const existingQuotes = JSON.parse(
      localStorage.getItem("savedQuotes") || "[]"
    );
    const updatedQuotes = [newQuote, ...existingQuotes];
    localStorage.setItem("savedQuotes", JSON.stringify(updatedQuotes));

    alert("Quote saved successfully!");
  }

  // Called by ResultsPanel when user clicks "Export PDF"
  function handleExportPDF(resultObj) {
    if (!resultObj) {
      alert("Please calculate an estimate first!");
      return;
    }
    console.log("Triggering PDF export for:", resultObj.quoteNumber);
  }

  // Called by ResultsPanel when user clicks "Email Quote"
  function handleEmailQuote(resultObj) {
    if (!resultObj) {
      alert("Please calculate an estimate first!");
      return;
    }
    // Build `mailto:` link
    const quoteNum = resultObj.quoteNumber;
    const clientName = resultObj.clientName || "Valued Customer";
    const jobType = resultObj.jobType;
    const qty = resultObj.itemsNeeded;
    const totalCost = resultObj.costBreakdown.total.toFixed(2);
    const perItemCost = (resultObj.costBreakdown.total / qty).toFixed(3);
    const delivery = resultObj.prodRes.delivery;

    const subject = `Printing Quote ${quoteNum}`;
    const body =
      `Dear ${clientName},%0D%0A%0D%0APlease find below your printing estimate:%0D%0A%0D%0A` +
      `Job Type: ${jobType}%0D%0AQuantity: ${qty}%0D%0ATotal Cost: USD ${totalCost}%0D%0A` +
      `Cost per Item: USD ${perItemCost}%0D%0AEstimated Delivery: ${delivery}%0D%0A%0D%0A` +
      `This quote is valid for 30 days.%0D%0A%0D%0ABest regards,%0D%0AProfessional Printing Services`;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${body}`;
  }

  // Function to handle "Go to Billing" button
  function handleGoToBilling() {
    if (!results) {
      alert("Please calculate an estimate first!");
      return;
    }
    // Results already saved to localStorage, redirect to billing page
    window.location.href = "/dashboard/billing";
  }

  function handleResetForm() {
    setResults(null);
    localStorage.removeItem("currentResults");
  }

  return (
    <>
      <Head>
        <title>Professional Printing Dashboard - Job Estimation</title>
        <meta
          name="description"
          content="Professional printing job estimation system."
        />
      </Head>

      <div className="min-h-screen p-4">
        <div className="max-w-7xl w-full mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Content Section */}
          <div className="p-8">
            <div className="w-full">
              {/* Estimation Form */}
              <EstimationForm
                onCalculate={handleCalculateEstimate}
                onGoToBilling={handleGoToBilling}
                hasResults={!!results}
                onReset={handleResetForm}
              />

              <div>
                <ResultsPanel
                  results={results}
                  onSaveQuote={handleSaveQuote}
                  onExportPDF={handleExportPDF}
                  onEmailQuote={handleEmailQuote}
                  onGoToBilling={handleGoToBilling}
                />

                {/* Only render DiePatternCanvas when results exist */}
                {results && (
                  <DiePatternCanvas
                    sheetLength={results.sheetL}
                    sheetWidth={results.sheetW}
                    itemLength={results.itemL}
                    itemWidth={results.itemW}
                    orientation={results.orientation}
                    efficiency={results.matEff?.efficiency}
                    itemsPerSheet={results.itemsPerSheet}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
