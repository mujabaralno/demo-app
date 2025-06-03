"use client"
import { useState, useEffect } from "react";
import Head from "next/head";
import HeadNav from "@/components/dashboard/shared/HeadNav";
import BillingPanel from "@/components/dashboard/BillingPanel";
import Link from "next/link";

export default function BillingPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load results from localStorage when component mounts
    try {
      const savedResults = localStorage.getItem('currentResults');
      if (savedResults) {
        setResults(JSON.parse(savedResults));
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
    setLoading(false);
  }, []);

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
        <title>Professional Printing Dashboard - Billing & Invoicing</title>
        <meta name="description" content="Professional printing billing and invoicing system." />
      </Head>

      <div className="min-h-screen p-4">
        <div className="max-w-[1600px] mx-auto bg-white rounded-lg shadow-xl overflow-hidden">


          {/* Content Section */}
          <div className="p-8">
            {results ? (
              <BillingPanel results={results} />
            ) : (
              <div className="card p-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    No Invoice Data Available
                  </h2>
                  <p className="text-gray-600 mb-6">
                    No invoice or results to display. Please calculate an estimate first.
                  </p>
                  <Link 
                    href="/" 
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Go to Job Estimation
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}