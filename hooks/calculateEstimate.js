// calculateEstimate.js
import {
  calculateMaxItemsPerSheet,
  calculateProductionTime,
  calculateMaterialEfficiency,
} from "./index";
import { calculateCost } from "./CalculateCost";

export function calculateEstimate(inputs) {
  const {
    jobType,
    itemsNeeded,
    itemL,
    itemW,
    printSides,
    rushLevel,
    sheetSize,
    hasAdditions,
    clientName,
  } = inputs;

  const {
    count: itemsPerSheet,
    orientation,
    effL,
    effW,
  } = calculateMaxItemsPerSheet(
    sheetSize.length,
    sheetSize.width,
    itemL,
    itemW
  );
  if (itemsPerSheet === 0) {
    throw new Error(
      "Item dimensions are too large for the selected paper size."
    );
  }
  const totalSheets = Math.ceil(itemsNeeded / itemsPerSheet);
  const costRes = calculateCost(
    totalSheets,
    printSides,
    rushLevel,
    inputs.paperType === "Custom" ? 1.1 : 1.0,
    {
      folding: inputs.addFolding,
      numFoldLines: inputs.numFoldLines || 1,
      foiling: inputs.addFoiling,
      embossing: inputs.addEmbossing,
      uvPrinting: inputs.addUvPrinting,
      lamination: inputs.addLamination,
      dieCutting: inputs.addDieCutting,
    }
  );

  const prodRes = calculateProductionTime(
    totalSheets,
    printSides,
    hasAdditions,
    jobType,
    rushLevel
  );
  const matEff = calculateMaterialEfficiency(
    sheetSize.length,
    sheetSize.width,
    itemL,
    itemW,
    itemsPerSheet
  );

  return {
    quoteNumber: `PE-${String(inputs.currentQuoteNumber).padStart(3, "0")}`,
    clientName: clientName || "Unnamed Client",
    jobType,
    itemsNeeded,
    itemL,
    itemW,
    sheetL: sheetSize.length,
    sheetW: sheetSize.width,
    itemsPerSheet,
    totalSheets,
    printSides,
    rushLevel,
    costBreakdown: costRes,
    prodRes,
    matEff,
    orientation,
    rawEffL: effL,
    rawEffW: effW,
  };
}

export function getSmartSuggestions(result) {
  const baseL = result.itemL;
  const baseW = result.itemW;
  const sheetL = result.sheetL;
  const sheetW = result.sheetW;
  const currentIPS = result.itemsPerSheet;
  const currentEff = parseFloat(result.matEff.efficiency);

  const deltas = [-0.3, -0.2, -0.1, 0.1, 0.2, 0.3];
  let suggestions = [];

  deltas.forEach((delta) => {
    const newL = parseFloat((baseL + delta).toFixed(1));
    if (newL <= 0) return;

    const { count: newIPS } = calculateMaxItemsPerSheet(
      sheetL,
      sheetW,
      newL,
      baseW
    );
    if (newIPS > currentIPS) {
      const mat = calculateMaterialEfficiency(
        sheetL,
        sheetW,
        newL,
        baseW,
        newIPS
      );
      suggestions.push({
        length: newL,
        width: baseW,
        itemsPerSheet: newIPS,
        efficiency: parseFloat(mat.efficiency),
        deltaIPS: newIPS - currentIPS,
        deltaEff: (parseFloat(mat.efficiency) - currentEff).toFixed(1),
      });
    }
  });

  return suggestions
    .sort(
      (a, b) => b.itemsPerSheet - a.itemsPerSheet || b.efficiency - a.efficiency
    )
    .slice(0, 3);
}

export function getQuantityRecommendations(result) {
  const baseQty = result.itemsNeeded;
  const step = Math.ceil(baseQty * 0.2);
  const variations = [-1, 0, 1, 2];

  const recommendations = variations.map((mult) => {
    const qty = baseQty + mult * step;
    const sheets = Math.ceil(qty / result.itemsPerSheet);
    const costRes = calculateCost(
      sheets,
      result.printSides,
      result.rushLevel,
      result.paperType === "Custom" ? 1.1 : 1.0, // fallback multiplier
      {
        folding: result.addFolding,
        numFoldLines: result.numFoldLines || 1,
        foiling: result.addFoiling,
        embossing: result.addEmbossing,
        uvPrinting: result.addUvPrinting,
        lamination: result.addLamination,
        dieCutting: result.addDieCutting,
      }
    );
    const total = costRes.total;
    const cpu = total / qty;
    return { qty, total, cpu };
  });

  const base = recommendations[1];
  return recommendations.map((r) => ({
    ...r,
    savings: ((base.cpu - r.cpu) / base.cpu) * 100,
  }));
}
