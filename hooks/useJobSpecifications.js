function calculateProductionTime(totalSheets, printSides, hasAdditions, jobType, rushLevel) {
  let hours = 2;
  hours += Math.ceil(totalSheets / 100) * 0.5;
  if (hasAdditions) hours += 2;
  if (printSides === 2) hours += 1;

  const complexity = {
    'Business Card': 1.0,
    'Flyer': 1.2,
    'Poster': 1.5,
    'Brochure': 2.0,
    'Banner': 1.8,
    'Catalog': 2.5,
    'Other': 1.3
  };
  hours *= complexity[jobType] || 1.0;

  if (rushLevel === 'rush') hours *= 0.6;
  if (rushLevel === 'same-day') hours *= 0.3;

  const days = Math.ceil(hours / 8);
  const delivery = new Date();
  delivery.setDate(delivery.getDate() + days);
  return {
    hours: Math.ceil(hours),
    days: days,
    delivery: delivery.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  };
}

// MAIN: calculateEstimate()
function calculateEstimate() {
  // Validate inputs
  const qtyEl   = document.getElementById('cardsNeeded');
  const lenEl   = document.getElementById('outputLength');
  const widEl   = document.getElementById('outputWidth');
  const qtyOK   = validatePositive(qtyEl, document.getElementById('cardsNeededError'), 'Please enter a valid quantity (≥ 1).');
  const lenOK   = validatePositive(lenEl, document.getElementById('outputLengthError'), 'Please enter ≥ 1 cm.');
  const widOK   = validatePositive(widEl, document.getElementById('outputWidthError'), 'Please enter ≥ 1 cm.');

  let sheetOK = true;
  if (document.getElementById('paperType').value === 'Custom') {
    const sLenEl = document.getElementById('inputLength');
    const sWidEl = document.getElementById('inputWidth');
    const sLenOK = validatePositive(sLenEl, document.getElementById('inputLengthError'), 'Please enter ≥ 1 cm.');
    const sWidOK = validatePositive(sWidEl, document.getElementById('inputWidthError'), 'Please enter ≥ 1 cm.');
    sheetOK = sLenOK && sWidOK;
  }
  let foldOK = true;
  if (document.getElementById('addFolding').checked) {
    const nfEl = document.getElementById('numFoldLines');
    const v = parseInt(nfEl.value);
    if (isNaN(v) || v < 1 || v > 6) {
      const err = document.getElementById('numFoldLinesError');
      err.textContent = 'Enter 1–6.';
      err.classList.remove('hidden');
      foldOK = false;
    } else {
      document.getElementById('numFoldLinesError').classList.add('hidden');
    }
  }
  if (!qtyOK || !lenOK || !widOK || !sheetOK || !foldOK) {
    return;
  }

  // Gather inputs
  const jobType = document.getElementById('jobType').value;
  const itemsNeeded = parseInt(qtyEl.value);
  const itemL = parseFloat(lenEl.value);
  const itemW = parseFloat(widEl.value);
  const printSides = parseInt(document.querySelector('input[name="printSides"]:checked').value);
  const rushLevel = document.getElementById('rushOrder').value;
  const sheetSize = getSelectedPaperSize();
  const hasAdditions = ['addFolding','addFoiling','addEmbossing','addUvPrinting','addLamination','addDieCutting']
    .some(id => document.getElementById(id).checked);

  // Calculate items per sheet (pure division)
  const { count: itemsPerSheet, orientation, effL, effW } = calculateMaxItemsPerSheet(
    sheetSize.length, sheetSize.width, itemL, itemW
  );
  if (itemsPerSheet === 0) {
    alert('Item dimensions are too large for the selected paper size.');
    return;
  }
  const totalSheets = Math.ceil(itemsNeeded / itemsPerSheet);

  // Costs (MVP)
  const costRes = calculateCost(totalSheets, printSides);

  // Production/Time
  const prodRes = calculateProductionTime(totalSheets, printSides, hasAdditions, jobType, rushLevel);

  // Material Efficiency
  const matEff = calculateMaterialEfficiency(sheetSize.length, sheetSize.width, itemL, itemW, itemsPerSheet);

  // Save currentCalc
  const currentCalc = {
    quoteNumber: `PE-${String(currentQuoteNumber).padStart(3, '0')}`,
    clientName: document.getElementById('clientName').value || 'Unnamed Client',
    jobType, itemsNeeded, itemL, itemW,
    sheetL: sheetSize.length, sheetW: sheetSize.width,
    itemsPerSheet, totalSheets, printSides, rushLevel,
    costBreakdown: costRes, prodRes, matEff, orientation,
    rawEffL: effL,   // store raw dimensions (either itemL/itemW or swapped)
    rawEffW: effW
  };

  // Update UI
  document.getElementById('estimatedCost').textContent = formatUSD(costRes.total);
  document.getElementById('costPerItem').textContent = formatUSD(costRes.total / itemsNeeded) + ' per item';
  document.getElementById('cardsPerSheet').textContent = itemsPerSheet;
  document.getElementById('totalSheetsRequired').textContent = totalSheets;
  document.getElementById('materialEfficiency').textContent = matEff.efficiency + '%';
  document.getElementById('productionTime').textContent = prodRes.days;

  updateCostBreakdown(costRes);
  renderRecommendationsAndAnalysis();
  drawEnhancedDiePattern(
    sheetSize.length, sheetSize.width,
    itemL, itemW,
    orientation,
    matEff.efficiency,
    itemsPerSheet,
    currentCalc.rawEffL,
    currentCalc.rawEffW
  );
  renderInvoice();

  // Automatically switch to Billing tab so user can see invoice
  switchSection('billing');
}