"use client"
import { useState } from 'react';

export const useTabNavigation = (defaultTab = 'results') => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = [
    { id: 'results', label: 'Results' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'quotes', label: 'Quotes' }
  ];

  const switchTab = (tabId) => {
    if (tabs.find(tab => tab.id === tabId)) {
      setActiveTab(tabId);
    }
  };

  const getTabClass = (tabId) => {
    return activeTab === tabId 
      ? 'bg-white text-blue-600 shadow-md' 
      : 'text-gray-600 hover:text-gray-800';
  };

  return {
    activeTab,
    tabs,
    setActiveTab,
    switchTab,
    getTabClass
  };
};