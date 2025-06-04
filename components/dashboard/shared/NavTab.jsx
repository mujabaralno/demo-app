// components/NavBar.js
import { useState } from 'react';

export default function NavBar({ activeSection, onChangeSection }) {
  // activeSection: string, either 'estimation', 'billing', or 'quotes'
  const items = [
    { key: 'estimation', label: 'Job Estimation', icon: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { key: 'billing', label: 'Billing & Invoicing', icon: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
      </svg>
    )},
    { key: 'quotes', label: 'Quote Management', icon: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
      </svg>
    )},
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 border-b border-gray-200">
      {items.map(item => (
        <div
          key={item.key}
          onClick={() => onChangeSection(item.key)}
          className={`
            flex items-center p-3 rounded-xl cursor-pointer transition
            ${activeSection === item.key
              ? 'bg-primary-blue-light text-white shadow-lg'
              : 'bg-white border-2 border-transparent hover:border-primary-blue-light hover:shadow-md'}
          `}
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
