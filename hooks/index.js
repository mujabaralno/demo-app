export function calculateMaxItemsPerSheet(sheetL, sheetW, itemL, itemW) {
  const adjL = itemL   // do NOT add bleed
  const adjW = itemW   // do NOT add bleed
  const usableL = sheetL  // do NOT subtract grip
  const usableW = sheetW  // do NOT subtract grip

  const count1 = Math.floor(usableL / adjL) * Math.floor(usableW / adjW)
  const count2 = Math.floor(usableL / adjW) * Math.floor(usableW / adjL)
  if (count1 >= count2) {
    return { count: count1, orientation: 'normal', effL: adjL, effW: adjW }
  }
  return { count: count2, orientation: 'rotated', effL: adjW, effW: adjL }
}

export function calculateMaterialEfficiency(sheetL, sheetW, itemL, itemW, itemsPerSheet) {
  const bleed = 0.3;
  const grip = 1.0;
  const usableArea = (sheetL - grip) * (sheetW - grip);
  const itemArea = (itemL + bleed) * (itemW + bleed);
  const usedArea = itemsPerSheet * itemArea;
  const waste = usableArea - usedArea;
  const efficiency = (usedArea / usableArea) * 100;
  return {
    efficiency: efficiency.toFixed(1),
    wasteArea: waste.toFixed(1)
  };
}

// ================ calculate Production Time ============== //
export function calculateProductionTime(
  totalSheets,
  printSides,
  hasAdditions,
  jobType,
  rushLevel
) {
  let hours = 2;
  hours += Math.ceil(totalSheets / 100) * 0.5;
  if (hasAdditions) hours += 2;
  if (printSides === 2) hours += 1;

  const complexity = {
    "Business Card": 1.0,
    Flyer: 1.2,
    Poster: 1.5,
    Brochure: 2.0,
    Banner: 1.8,
    Catalog: 2.5,
    Other: 1.3,
  };
  hours *= complexity[jobType] || 1.0;

  if (rushLevel === "rush") hours *= 0.6;
  if (rushLevel === "same-day") hours *= 0.3;

  const days = Math.ceil(hours / 8);
  const delivery = new Date();
  delivery.setDate(delivery.getDate() + days);
  return {
    hours: Math.ceil(hours),
    days: days,
    delivery: delivery.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}


// ================ Calculate ============== //

