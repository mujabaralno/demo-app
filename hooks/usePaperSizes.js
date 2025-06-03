"use client"
import { useState, useEffect } from 'react';

const PAPER_SIZES = {
  SRA3: { length: 45, width: 32 },
  A3: { length: 42, width: 29.7 },
  SRA2: { length: 64, width: 45 }
};

export const usePaperSizes = (initialPaperType = 'SRA3') => {
  const [paperType, setPaperType] = useState(initialPaperType);
  const [inputLength, setInputLength] = useState(PAPER_SIZES[initialPaperType].length);
  const [inputWidth, setInputWidth] = useState(PAPER_SIZES[initialPaperType].width);

  useEffect(() => {
    if (paperType !== 'Custom' && PAPER_SIZES[paperType]) {
      setInputLength(PAPER_SIZES[paperType].length);
      setInputWidth(PAPER_SIZES[paperType].width);
    }
  }, [paperType]);

  const updatePaperType = (newPaperType) => {
    setPaperType(newPaperType);
  };

  const updateCustomSize = (length, width) => {
    if (paperType === 'Custom') {
      setInputLength(length);
      setInputWidth(width);
    }
  };

  return {
    paperType,
    inputLength,
    inputWidth,
    paperSizes: PAPER_SIZES,
    updatePaperType,
    updateCustomSize,
    setInputLength,
    setInputWidth
  };
};