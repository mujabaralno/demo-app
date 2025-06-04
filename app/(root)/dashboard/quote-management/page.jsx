"use client"
import { useState, useEffect } from "react";
import Head from "next/head";
import QuoteManagementPanel from "@/components/dashboard/QuoteManagementPanel";
import Link from "next/link";
import { toast } from "sonner"

export default function QuotesPage() {
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load quotes from localStorage when component mounts
    try {
      const quotes = localStorage.getItem('savedQuotes');
      if (quotes) {
        setSavedQuotes(JSON.parse(quotes));
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
    }
    setLoading(false);
  }, []);

  // QuoteManagement callbacks
  function handleRemoveQuote(id) {
    const updatedQuotes = savedQuotes.filter((q) => q.id !== id);
    setSavedQuotes(updatedQuotes);
    localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
  }

  function handleClearAllQuotes() {
    setSavedQuotes([]);
    localStorage.removeItem('savedQuotes');
  }

  function handleExportAllQuotes() {
    if (!savedQuotes || savedQuotes.length === 0) {
      toast.error("No quotes to export!");
      return;
    }
    let csv = "data:text/csv;charset=utf-8,";
    csv +=
      "Quote#,Client,JobType,Qty,TotalCost,CostPerItem,Efficiency,RushOrder,Date\n";
    savedQuotes.forEach((q) => {
      csv += `${q.quoteNumber},${q.clientName},${q.jobType},${q.quantity},${q.totalCost.toFixed(
        2
      )},${q.costPerItem.toFixed(3)},${q.efficiency}%,${q.rushOrder},${q.timestamp}\n`;
    });
    const uri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", uri);
    link.setAttribute("download", "printing_quotes_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-[1600px] mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Professional Printing Dashboard - Quote Management</title>
        <meta name="description" content="Professional printing quote management system." />
      </Head>

      <div className="min-h-screen p-4">
      <div className="md:hidden flex">
          <Link
            className="btn btn-primary md:hidden flex my-5"
            href="/dashboard"
          >
            Back Home
          </Link>
        </div>
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">

          {/* Content Section */}
          <div className="p-8">
            {savedQuotes.length === 0 && !loading ? (
              <div className="card p-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    No Saved Quotes
                  </h2>
                  <p className="text-gray-600 mb-6">
                    You haven't saved any quotes yet. Create and save quotes from the Job Estimation page.
                  </p>
                  <Link 
                    href="/" 
                    className="btn btn-primary"
                  >
                    Go to Job Estimation
                  </Link>
                </div>
              </div>
            ) : (
              <QuoteManagementPanel
                savedQuotes={savedQuotes}
                onRemoveQuote={handleRemoveQuote}
                onClearAll={handleClearAllQuotes}
                onExportAll={handleExportAllQuotes}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}