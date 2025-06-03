"use client"
import { useEffect, useState } from "react";

export default function Header({ currentQuoteNumber, currentEmployee }) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setFormattedDate(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  return (
    <div className=" relative overflow-hidden rounded-t-lg">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 60 60"
        >
          <g fill="none" fillRule="evenodd">
            <g fill="#FFFFFF" fillOpacity="0.1">
              <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" />
            </g>
          </g>
        </svg>
      </div>

      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-2 text-black">
          Professional Printing Dashboard
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm opacity-90 text-gray-500">
          <span>Quote #{currentQuoteNumber}</span>
          <span>|</span>
          <span>{formattedDate}</span>
          <span>|</span>
          <span>Valid for 30 days</span>
          <span>|</span>
          <span>
            Employee: <strong>{currentEmployee}</strong>
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="status-indicator status-active">System Online</div>
          <div className="status-indicator status-completed">
            Daily Backup Complete
          </div>
          <div className="status-indicator status-pending">
            3 Pending Quotes
          </div>
        </div>
      </div>
    </div>
  );
}
