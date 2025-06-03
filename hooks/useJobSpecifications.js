"use client"

import { useState } from 'react';

export const useJobSpecifications = () => {
  const [jobType, setJobType] = useState('Business Card');
  const [cardsNeeded, setCardsNeeded] = useState(1000);
  const [printSides, setPrintSides] = useState(1);
  const [outputLength, setOutputLength] = useState(9);
  const [outputWidth, setOutputWidth] = useState(5);

  const jobTypeOptions = [
    'Business Card',
    'Flyer',
    'Poster',
    'Brochure',
    'Other'
  ];

  const updateJobSpecifications = (specs) => {
    if (specs.jobType !== undefined) setJobType(specs.jobType);
    if (specs.cardsNeeded !== undefined) setCardsNeeded(specs.cardsNeeded);
    if (specs.printSides !== undefined) setPrintSides(specs.printSides);
    if (specs.outputLength !== undefined) setOutputLength(specs.outputLength);
    if (specs.outputWidth !== undefined) setOutputWidth(specs.outputWidth);
  };

  const resetJobSpecifications = () => {
    setJobType('Business Card');
    setCardsNeeded(1000);
    setPrintSides(1);
    setOutputLength(9);
    setOutputWidth(5);
  };

  return {
    jobSpecs: {
      jobType,
      cardsNeeded,
      printSides,
      outputLength,
      outputWidth
    },
    setters: {
      setJobType,
      setCardsNeeded,
      setPrintSides,
      setOutputLength,
      setOutputWidth
    },
    jobTypeOptions,
    updateJobSpecifications,
    resetJobSpecifications
  };
};