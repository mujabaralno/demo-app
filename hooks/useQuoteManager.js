"use client"
import { useState } from 'react';

export const useQuoteManager = () => {
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [quoteNumber, setQuoteNumber] = useState('PE-001');

  const saveQuote = (quoteData) => {
    const quote = {
      id: Date.now(),
      quoteNumber: `PE-${String(savedQuotes.length + 1).padStart(3, '0')}`,
      date: new Date().toLocaleDateString(),
      ...quoteData
    };
    
    setSavedQuotes(prev => [...prev, quote]);
    return quote;
  };

  const clearAllQuotes = () => {
    setSavedQuotes([]);
  };

  const removeQuote = (quoteId) => {
    setSavedQuotes(prev => prev.filter(quote => quote.id !== quoteId));
  };

  const getQuoteById = (quoteId) => {
    return savedQuotes.find(quote => quote.id === quoteId);
  };

  return {
    savedQuotes,
    quoteNumber,
    saveQuote,
    clearAllQuotes,
    removeQuote,
    getQuoteById
  };
};