export const useEfficiencyAnalysis = () => {
    const calculateMaterialEfficiency = (
      outputLength,
      outputWidth,
      cardsPerSheet,
      inputLength,
      inputWidth
    ) => {
      const usedArea = outputLength * outputWidth * cardsPerSheet;
      const totalArea = inputLength * inputWidth;
      const efficiency = (usedArea / totalArea) * 100;
      const wasteArea = totalArea - usedArea;
  
      return { efficiency, wasteArea };
    };
  
    const getEfficiencyBadge = (efficiency) => {
      if (efficiency >= 80) {
        return { 
          class: 'bg-green-100 text-green-800', 
          text: 'High Efficiency' 
        };
      }
      if (efficiency >= 60) {
        return { 
          class: 'bg-yellow-100 text-yellow-800', 
          text: 'Medium Efficiency' 
        };
      }
      return { 
        class: 'bg-red-100 text-red-800', 
        text: 'Low Efficiency' 
      };
    };
  
    const getEfficiencyRecommendation = (efficiency) => {
      if (efficiency >= 80) {
        return "Excellent material efficiency! Your current layout optimizes paper usage.";
      }
      if (efficiency >= 60) {
        return "Good efficiency. Consider adjusting dimensions slightly to reduce waste.";
      }
      return "Low efficiency detected. Consider resizing your items or choosing a different paper size to minimize waste.";
    };
  
    const getCostOptimizationTip = (costPerItem) => {
      if (costPerItem < 0.10) {
        return "Excellent cost per item! This quantity provides good economies of scale.";
      }
      return "Consider increasing quantity for better per-unit pricing, or optimize dimensions to fit more items per sheet.";
    };
  
    return {
      calculateMaterialEfficiency,
      getEfficiencyBadge,
      getEfficiencyRecommendation,
      getCostOptimizationTip
    };
  };
  