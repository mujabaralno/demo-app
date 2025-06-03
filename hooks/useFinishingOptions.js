"use client"

import { useState } from 'react';

export const useFinishingOptions = () => {
  const [addFolding, setAddFolding] = useState(false);
  const [addFoiling, setAddFoiling] = useState(false);
  const [addEmbossing, setAddEmbossing] = useState(false);
  const [addUvPrinting, setAddUvPrinting] = useState(false);
  const [numFoldLines, setNumFoldLines] = useState(1);

  const calculateFinishingCost = (cardsNeeded) => {
    const foldingCost = addFolding ? numFoldLines * 0.15 * cardsNeeded : 0;
    const foilingCost = addFoiling ? 0.25 * cardsNeeded : 0;
    const embossingCost = addEmbossing ? 0.30 * cardsNeeded : 0;
    const uvPrintingCost = addUvPrinting ? 0.20 * cardsNeeded : 0;
    
    return foldingCost + foilingCost + embossingCost + uvPrintingCost;
  };

  const getAdditionalProductionDays = () => {
    return (addFolding || addFoiling || addEmbossing || addUvPrinting) ? 1 : 0;
  };

  const resetFinishingOptions = () => {
    setAddFolding(false);
    setAddFoiling(false);
    setAddEmbossing(false);
    setAddUvPrinting(false);
    setNumFoldLines(1);
  };

  return {
    finishingOptions: {
      addFolding,
      addFoiling,
      addEmbossing,
      addUvPrinting,
      numFoldLines
    },
    setters: {
      setAddFolding,
      setAddFoiling,
      setAddEmbossing,
      setAddUvPrinting,
      setNumFoldLines
    },
    calculateFinishingCost,
    getAdditionalProductionDays,
    resetFinishingOptions
  };
};