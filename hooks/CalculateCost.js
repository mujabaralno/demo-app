import {
  TIERED_SHEET_PRICING,
  COST_PER_SIDE_SURCHARGE,
  ADDITION_COSTS,
  RUSH_MULTIPLIERS,
  PROFIT_MARGIN,
  SETUP_COST
} from "@/constants";

export function calculateMaxItemsPerSheet(sheetL, sheetW, itemL, itemW) {
  const bleed = 0.3; // 3mm bleed
  const grip = 1.0; // 1cm gripper margin
  const adjL = itemL + bleed;
  const adjW = itemW + bleed;
  const usableL = sheetL - grip;
  const usableW = sheetW - grip;

  const count1 = Math.floor(usableL / adjL) * Math.floor(usableW / adjW);
  const count2 = Math.floor(usableL / adjW) * Math.floor(usableW / adjL);
  if (count1 >= count2) {
    return { count: count1, orientation: "normal", effL: adjL, effW: adjW };
  }
  return { count: count2, orientation: "rotated", effL: adjW, effW: adjL };
}

export function calculateCost(
  totalSheets,
  printSides,
  rushLevel,
  paperCostMultiplier,
  additionsFlags
) {
  // 1) Base sheet cost (tiered pricing × multiplier)
  let baseCost = 0;
  for (let tier of TIERED_SHEET_PRICING) {
    if (totalSheets <= tier.maxSheets) {
      baseCost = totalSheets * tier.pricePerSheet * paperCostMultiplier;
      break;
    }
  }

  // 2) Printing surcharge (per extra side)
  const printSurcharge =
    totalSheets * COST_PER_SIDE_SURCHARGE * (printSides - 1);

  // 3) Additions (folding, foiling, embossing, UV, lamination, die‐cutting)
  let additions = {};
  let totalAddCost = 0;
  if (additionsFlags.folding) {
    const nLines = additionsFlags.numFoldLines || 1;
    const c = totalSheets * nLines * ADDITION_COSTS.foldingPerLinePerSheet;
    additions["Folding"] = c;
    totalAddCost += c;
  }
  if (additionsFlags.foiling) {
    const c = totalSheets * ADDITION_COSTS.foilingPerSheet;
    additions["Foil Stamping"] = c;
    totalAddCost += c;
  }
  if (additionsFlags.embossing) {
    const c = totalSheets * ADDITION_COSTS.embossingPerSheet;
    additions["Embossing"] = c;
    totalAddCost += c;
  }
  if (additionsFlags.uvPrinting) {
    const c = totalSheets * ADDITION_COSTS.uvPrintingPerSheet;
    additions["UV Coating"] = c;
    totalAddCost += c;
  }
  if (additionsFlags.lamination) {
    const c = totalSheets * ADDITION_COSTS.laminationPerSheet;
    additions["Lamination"] = c;
    totalAddCost += c;
  }
  if (additionsFlags.dieCutting) {
    const c = totalSheets * ADDITION_COSTS.dieCuttingPerSheet;
    additions["Die Cutting"] = c;
    totalAddCost += c;
  }

  // 4) Setup
  const costBeforeRush = baseCost + printSurcharge + SETUP_COST + totalAddCost;

  // 5) Rush
  const rushMul = RUSH_MULTIPLIERS[rushLevel];
  const subTotal = costBeforeRush * rushMul;
  const profit = subTotal * PROFIT_MARGIN;
  const total = subTotal + profit;

  return {
    baseCost: costBeforeRush,
    additions: additions,
    rushSurcharge: subTotal - costBeforeRush,
    profit: profit,
    total: total,
  };
}
