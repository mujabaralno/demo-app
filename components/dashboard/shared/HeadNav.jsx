"use client"
import { useEffect, useState } from "react";

export default function Header({ currentQuoteNumber, currentEmployee, location }) {
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
    <div className="relative overflow-hidden">
      <div className="relative z-10 ">
        <h1 className="text-4xl font-bold mb-2 text-black">
          Professional Printing Dashboard
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm opacity-90 text-gray-500">
          <span>Quote #{currentQuoteNumber}</span>
          <span>|</span>
          <span>{formattedDate}</span>
          <span>|</span>
          <span>{location}</span>
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
