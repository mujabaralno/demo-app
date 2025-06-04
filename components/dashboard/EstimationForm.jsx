"use client";
import React, { useState, useEffect } from "react";
import NumberInput from "./shared/NumberInput";
import RadioInput from "./shared/RadioInput";
import CheckboxInput from "./shared/CheckboxInput";
import SelectInput from "./shared/SelectInput";

import { paperSizes } from "@/constants";
import { validatePositive } from "@/lib/utils";
import { calculateCost } from "@/hooks/CalculateCost";
import {
  calculateMaxItemsPerSheet,
  calculateProductionTime,
  calculateMaterialEfficiency,
} from "@/hooks";

const EstimationForm = ({ onCalculate, onGoToBilling, hasResults, onReset }) => {
  const [jobType, setJobType] = useState("Business Card");
  const [cardsNeeded, setCardsNeeded] = useState(1000);
  const [paperType, setPaperType] = useState("SRA3");
  const [clientName, setClientName] = useState("");
  const [customLength, setCustomLength] = useState(45);
  const [customWidth, setCustomWidth] = useState(32);
  const [itemLength, setItemLength] = useState(9);
  const [itemWidth, setItemWidth] = useState(5);
  const [printSides, setPrintSides] = useState(1);
  const [addFolding, setAddFolding] = useState(false);
  const [numFoldLines, setNumFoldLines] = useState(1);
  const [addFoiling, setAddFoiling] = useState(false);
  const [addEmbossing, setAddEmbossing] = useState(false);
  const [addUvPrinting, setAddUvPrinting] = useState(false);
  const [addLamination, setAddLamination] = useState(false);
  const [addDieCutting, setAddDieCutting] = useState(false);
  const [rushOrder, setRushOrder] = useState("standard");

  // Error messages (just track booleans)
  const [qtyError, setQtyError] = useState(false);
  const [itemLenError, setItemLenError] = useState(false);
  const [itemWidError, setItemWidError] = useState(false);
  const [paperLenError, setPaperLenError] = useState(false);
  const [paperWidError, setPaperWidError] = useState(false);
  const [foldLinesError, setFoldLinesError] = useState(false);

  // Show/hide custom size fields
  const [showCustomSize, setShowCustomSize] = useState(false);
  // Show/hide fold lines
  const [showFoldLines, setShowFoldLines] = useState(false);

  // Whenever paperType changes to "Custom," show custom inputs
  useEffect(() => {
    if (paperType === "Custom") {
      setShowCustomSize(true);
    } else {
      setShowCustomSize(false);
      // Reset custom fields to the selected standard size
      setCustomLength(paperSizes[paperType].length);
      setCustomWidth(paperSizes[paperType].width);
      setPaperLenError(false);
      setPaperWidError(false);
    }
  }, [paperType]);

  // Whenever "Folding" toggles, show/hide numFoldLines
  useEffect(() => {
    setShowFoldLines(addFolding);
    if (!addFolding) {
      setNumFoldLines(1);
      setFoldLinesError(false);
    }
  }, [addFolding]);

  function handleCalculate(e) {
    e.preventDefault();
    let valid = true;

    if (!validatePositive(cardsNeeded)) {
      setQtyError(true);
      valid = false;
    } else {
      setQtyError(false);
    }
    if (!validatePositive(itemLength)) {
      setItemLenError(true);
      valid = false;
    } else {
      setItemLenError(false);
    }
    if (!validatePositive(itemWidth)) {
      setItemWidError(true);
      valid = false;
    } else {
      setItemWidError(false);
    }

    let sheetL = 0,
      sheetW = 0;
    if (paperType === "Custom") {
      if (!validatePositive(customLength)) {
        setPaperLenError(true);
        valid = false;
      } else {
        setPaperLenError(false);
      }
      if (!validatePositive(customWidth)) {
        setPaperWidError(true);
        valid = false;
      } else {
        setPaperWidError(false);
      }
      sheetL = parseFloat(customLength);
      sheetW = parseFloat(customWidth);
    } else {
      sheetL = paperSizes[paperType].length;
      sheetW = paperSizes[paperType].width;
    }
    if (addFolding) {
      const n = parseInt(numFoldLines);
      if (isNaN(n) || n < 1 || n > 6) {
        setFoldLinesError(true);
        valid = false;
      } else {
        setFoldLinesError(false);
      }
    }

    if (!valid) return;

    // 2) Compute items per sheet (and orientation)
    const { count: itemsPerSheet, orientation } = calculateMaxItemsPerSheet(
      sheetL,
      sheetW,
      parseFloat(itemLength),
      parseFloat(itemWidth)
    );
    if (itemsPerSheet === 0) {
      alert("Item dimensions are too large for the selected paper size.");
      return;
    }
    const totalSheets = Math.ceil(cardsNeeded / itemsPerSheet);

    // 3) Word up additions flags
    const additionsFlags = {
      folding: addFolding,
      numFoldLines: parseInt(numFoldLines) || 1,
      foiling: addFoiling,
      embossing: addEmbossing,
      uvPrinting: addUvPrinting,
      lamination: addLamination,
      dieCutting: addDieCutting,
    };

    // 4) Calculate costs
    const paperCostMultiplier =
      paperType === "Custom"
        ? paperSizes["Custom"].costMultiplier
        : paperSizes[paperType].costMultiplier;
    const costRes = calculateCost(
      totalSheets,
      printSides,
      rushOrder,
      paperCostMultiplier,
      additionsFlags
    );

    // 5) Calculate production time
    const prodRes = calculateProductionTime(
      totalSheets,
      printSides,
      Object.values(additionsFlags).some((f) => f),
      jobType,
      rushOrder
    );

    // 6) Calculate material efficiency
    const matEff = calculateMaterialEfficiency(
      sheetL,
      sheetW,
      parseFloat(itemLength),
      parseFloat(itemWidth),
      itemsPerSheet
    );

    // 7) Build a "results" object and hand it back to parent
    const resultObj = {
      quoteNumber: "", // parent will fill this
      clientName: clientName || "Unnamed Client",
      jobType,
      itemsNeeded: cardsNeeded,
      itemL: parseFloat(itemLength),
      itemW: parseFloat(itemWidth),
      sheetL,
      sheetW,
      itemsPerSheet,
      totalSheets,
      printSides,
      rushOrder,
      costBreakdown: costRes,
      prodRes,
      matEff,
      orientation,
      paperType, // Tambahkan paperType ke result object
    };

    // Pastikan onCalculate ada sebelum dipanggil
    if (onCalculate && typeof onCalculate === "function") {
      onCalculate(resultObj);
    } else {
      console.error("onCalculate prop is not provided or not a function");
    }
  }

  function handleReset() {
    setJobType("Business Card");
    setCardsNeeded(1000);
    setPaperType("SRA3");
    setClientName("");
    setCustomLength(45);
    setCustomWidth(32);
    setItemLength(9);
    setItemWidth(5);
    setPrintSides(1);
    setAddFolding(false);
    setNumFoldLines(1);
    setAddFoiling(false);
    setAddEmbossing(false);
    setAddUvPrinting(false);
    setAddLamination(false);
    setAddDieCutting(false);
    setRushOrder("standard");

    setQtyError(false);
    setItemLenError(false);
    setItemWidError(false);
    setPaperLenError(false);
    setPaperWidError(false);
    setFoldLinesError(false);

    if (onReset && typeof onReset === "function") {
      onReset();
    }
  }

  return (
    <form className="card p-6" onSubmit={handleCalculate}>
      <div className="mb-4 border-b pb-2">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          {/* Icon omitted for brevity */}
          Job Specifications
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Type */}
        <SelectInput
          label="Input Paper Type:"
          value={jobType}
          onChange={setJobType}
          options={[
            { value: "Business Card", label: "Business Card" },
            { value: "Flyer", label: "Flyer" },
            { value: "Poster", label: "Poster" },
            { value: "Brochure", label: "Brochure" },
            { value: "Banner", label: "Banner" },
            { value: "Catalog", label: "Catalog" },
            { value: "Other", label: "Other" },
          ]}
          showPlaceholder={true}
        />
       
        {/* Quantity */}
        <NumberInput
          label="Quantity Required:"
          value={cardsNeeded}
          onChange={setCardsNeeded}
          min={1}
          step={1}
        />

        {/* Paper Type */}
        <SelectInput
          label="Input Paper Type:"
          value={paperType}
          onChange={setPaperType}
          options={[
            { value: "SRA3", label: "SRA3 (45cm x 32cm)" },
            { value: "A3", label: "A3 (42cm x 29.7cm)" },
            { value: "SRA2", label: "SRA2 (64cm x 45cm)" },
            { value: "Custom", label: "Custom Size" },
          ]}
          showPlaceholder={false}
        />

        {/* Client Name */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase text-gray-600 mb-1">
            Client Name
          </p>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Enter client name"
            className="w-full text-black p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Custom Paper Size (if needed) */}
        {showCustomSize && (
          <div className="md:col-span-2 flex flex-col space-y-2">
            <NumberInput
              label="Custom Paper Length (cm)"
              value={customLength}
              onChange={setCustomLength}
              min={1}
              step={0.1}
            />
            {paperLenError && (
              <p className="text-red-500 text-xs">Please enter ≥ 1 cm.</p>
            )}

            <NumberInput
              label="Custom Paper Width (cm)"
              value={customWidth}
              onChange={setCustomWidth}
              min={1}
              step={0.1}
            />

            {paperWidError && (
              <p className="text-red-500 text-xs">Please enter ≥ 1 cm.</p>
            )}
          </div>
        )}

        {/* Item Dimensions */}
        <div className="flex flex-col">
          <NumberInput
            label="Item Length (cm)"
            value={itemLength}
            onChange={setItemLength}
            min={1}
            step={0.1}
          />
          {itemLenError && (
            <p className="text-red-500 text-xs">Please enter ≥ 1 cm.</p>
          )}
        </div>
        <div className="flex flex-col">
          <NumberInput
            label="Item Width (cm)"
            value={itemWidth}
            onChange={setItemWidth}
            min={1}
            step={0.1}
          />
          {itemWidError && (
            <p className="text-red-500 text-xs">Please enter ≥ 1 cm.</p>
          )}
        </div>

        {/* Print Sides */}
        <RadioInput
          label="Print Sides:"
          name="printSides"
          value={printSides}
          onChange={setPrintSides}
          options={[
            { value: 1, label: "Single Side" },
            { value: 2, label: "Double Sides" },
          ]}
          valueType="number"
          direction="horizontal"
        />

        {/* Finishing Options */}
        <div className="w-full">
          <div>
            <p className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Finishing Options:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <CheckboxInput
                label="Folding"
                checked={addFolding}
                onChange={setAddFolding}
              />
              <CheckboxInput
                label="Foil Stamping"
                checked={addFoiling}
                onChange={setAddFoiling}
              />
              <CheckboxInput
                label="Embossing/Debossing"
                checked={addEmbossing}
                onChange={setAddEmbossing}
              />
              <CheckboxInput
                label="UV Spot Coating"
                checked={addUvPrinting}
                onChange={setAddUvPrinting}
              />
              <CheckboxInput
                label="Lamination"
                checked={addLamination}
                onChange={setAddLamination}
              />
              <CheckboxInput
                label="Die Cutting"
                checked={addDieCutting}
                onChange={setAddDieCutting}
              />
            </div>
          </div>

          {addFolding && (
            <div className="mt-4">
              <NumberInput
                label="Number of Fold Lines:"
                value={numFoldLines}
                onChange={setNumFoldLines}
                min={1}
                step={1}
              />
            </div>
          )}
        </div>

        {/* Priority Level */}
        <SelectInput
          label="Input Paper Type:"
          value={rushOrder}
          onChange={setRushOrder}
          options={[
            { value: "standard", label: "(5–7 business days)" },
            { value: "rush", label: "Rush (2–3 business days) – +25%" },
            { value: "same-day", label: "Same Day – +50%" },
          ]}
          showPlaceholder={true}
        />

      </div>

      {/* Calculate / Reset Buttons */}
      <div className={`mt-6 grid grid-cols-1 ${hasResults ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
        <button
          type="submit"
          className="btn btn-primary flex items-center justify-center"
        >
          {/* Icon omitted for brevity */}
          Calculate Estimate
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-secondary flex items-center justify-center"
        >
          Reset Form
        </button>

        {hasResults && (
          <button
            type="button"
            onClick={() => onGoToBilling && onGoToBilling()}
            className="btn btn-success flex items-center justify-center"
          >
            Go to Billing
          </button>
        )}
      </div>
    </form>
  );
};

export default EstimationForm;