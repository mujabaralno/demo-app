import {
  TIERED_SHEET_PRICING,
  COST_PER_SIDE_SURCHARGE,
  ADDITION_COSTS,
  RUSH_MULTIPLIERS,
  SETUP_COST
} from "@/constants";

export function calculateCost(
  totalSheets,
  printSides,
  rushLevel,
  paperCostMultiplier,
  additionsFlags
) {
  console.log("=== DEBUG CALCULATE COST ===");
  console.log("Input params:", {
    totalSheets,
    printSides,
    rushLevel,
    paperCostMultiplier,
    additionsFlags
  });

  // 1) Base sheet cost (tiered pricing × multiplier)
  let baseCost = 0;
  for (let tier of TIERED_SHEET_PRICING) {
    if (totalSheets <= tier.maxSheets) {
      baseCost = totalSheets * tier.pricePerSheet * paperCostMultiplier;
      console.log("Base sheet cost calculation:", {
        totalSheets,
        pricePerSheet: tier.pricePerSheet,
        paperCostMultiplier,
        baseCost
      });
      break;
    }
  }

  // 2) Printing surcharge (per extra side)
  const printSurcharge = totalSheets * COST_PER_SIDE_SURCHARGE * (printSides - 1);
  console.log("Print surcharge:", {
    totalSheets,
    COST_PER_SIDE_SURCHARGE,
    printSides,
    printSurcharge
  });

  // 3) Setup cost
  console.log("Setup cost:", SETUP_COST);

  // 4) Additions (folding, foiling, embossing, UV, lamination, die‐cutting)
  let additions = {};
  let totalAddCost = 0;
  if (additionsFlags?.folding) {
    const nLines = additionsFlags.numFoldLines || 1;
    const c = totalSheets * nLines * ADDITION_COSTS.foldingPerLinePerSheet;
    additions["Folding"] = c;
    totalAddCost += c;
  }
  if (additionsFlags?.foiling) {
    const c = totalSheets * ADDITION_COSTS.foilingPerSheet;
    additions["Foil Stamping"] = c;
    totalAddCost += c;
  }
  if (additionsFlags?.embossing) {
    const c = totalSheets * ADDITION_COSTS.embossingPerSheet;
    additions["Embossing"] = c;
    totalAddCost += c;
  }
  if (additionsFlags?.uvPrinting) {
    const c = totalSheets * ADDITION_COSTS.uvPrintingPerSheet;
    additions["UV Coating"] = c;
    totalAddCost += c;
  }
  if (additionsFlags?.lamination) {
    const c = totalSheets * ADDITION_COSTS.laminationPerSheet;
    additions["Lamination"] = c;
    totalAddCost += c;
  }
  if (additionsFlags?.dieCutting) {
    const c = totalSheets * ADDITION_COSTS.dieCuttingPerSheet;
    additions["Die Cutting"] = c;
    totalAddCost += c;
  }
  console.log("Additions:", { additions, totalAddCost });

  // 5) Subtotal before rush
  const subtotalBeforeRush = baseCost + printSurcharge + SETUP_COST + totalAddCost;
  console.log("Subtotal before rush:", subtotalBeforeRush);

  // 6) Rush surcharge calculation
  const rushMul = RUSH_MULTIPLIERS[rushLevel] || 1.0;
  const rushSurcharge = subtotalBeforeRush * (rushMul - 1);
  console.log("Rush calculation:", {
    rushLevel,
    rushMul,
    rushSurcharge
  });

  // 7) Final total
  const finalTotal = subtotalBeforeRush + rushSurcharge;
  console.log("Final total:", finalTotal);

  const result = {
    baseCost: baseCost + printSurcharge + SETUP_COST,
    additions: additions,
    rushSurcharge: rushSurcharge,
    profit: 0,
    total: finalTotal,
  };

  console.log("Final result:", result);
  console.log("=== END DEBUG ===");

  return result;
}