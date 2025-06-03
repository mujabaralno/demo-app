// components/NavTabs.jsx
export default function NavTabs({ currentTab, onChangeTab }) {
    const tabs = [
      { id: "estimation", label: "Job Estimation" },
      { id: "billing",    label: "Billing & Invoicing" },
      { id: "quotes",     label: "Quote Management" },
    ];
  
    return (
      <div className="grid grid-cols-3 gap-4 bg-gray-100 px-6 py-4 border-b border-gray-200">
        {tabs.map((t) => (
          <div
            key={t.id}
            onClick={() => onChangeTab(t.id)}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
              currentTab === t.id
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-white border-2 border-transparent hover:border-blue-300 hover:shadow-md"
            }`}
          >
            <span>{t.label}</span>
          </div>
        ))}
      </div>
    );
  }
  