

import { formatUSD } from "@/lib/utils";

export default function QuoteManagementPanel({
  savedQuotes,
  onRemoveQuote,
  onClearAll,
  onExportAll,
}) {
  if (!savedQuotes || savedQuotes.length === 0) {
    return (
      <div className="card p-6 mt-8">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            {/* Icon omitted */}
            Quote Management
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onExportAll}
              className="btn btn-success text-xs px-3 py-1"
            >
              Export All
            </button>
            <button
              onClick={onClearAll}
              className="btn btn-secondary text-xs px-3 py-1"
            >
              Clear All
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-center py-8">
          No saved quotes yet. Calculate and save quotes to compare options.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 mt-8 overflow-x-auto">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          {/* Icon omitted */}
          Quote Management
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onExportAll}
            className="btn btn-success text-xs px-3 py-1"
          >
            Export All
          </button>
          <button
            onClick={onClearAll}
            className="btn btn-secondary text-xs px-3 py-1"
          >
            Clear All
          </button>
        </div>
      </div>
      <table className="data-table w-full">
        <thead>
          <tr>
            <th>Quote #</th>
            <th>Client</th>
            <th>Job Type</th>
            <th>Quantity</th>
            <th>Total Cost</th>
            <th>Per Item</th>
            <th>Efficiency</th>
            <th>Rush</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {savedQuotes.map((q) => {
            const rushLabel =
              q.rushOrder === "standard"
                ? "Standard"
                : q.rushOrder === "rush"
                ? "Rush"
                : "Same Day";
            const rushClass =
              q.rushOrder === "standard"
                ? "status-active"
                : q.rushOrder === "rush"
                ? "status-pending"
                : "status-completed";

            return (
              <tr key={q.id}>
                <td className="font-semibold">{q.quoteNumber}</td>
                <td>{q.clientName}</td>
                <td>{q.jobType}</td>
                <td>{q.quantity.toLocaleString()}</td>
                <td>{formatUSD(q.totalCost)}</td>
                <td>{q.costPerItem.toFixed(3)}</td>
                <td>{q.efficiency}%</td>
                <td>
                  <span className={`status-indicator ${rushClass}`}>
                    {rushLabel}
                  </span>
                </td>
                <td>{q.timestamp}</td>
                <td>
                  <button
                    onClick={() => onRemoveQuote(q.id)}
                    className="btn btn-secondary text-xs px-2 py-1"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}