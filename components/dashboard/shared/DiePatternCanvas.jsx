import { useRef, useEffect, useState } from "react";

export default function DiePatternCanvas({
  sheetLength,
  sheetWidth,
  itemLength,
  itemWidth,
  orientation,
  efficiency,
  itemsPerSheet,
  layoutType,
  materialUsage,
}) {
  const canvasRef = useRef(null);
  const [layoutInfo, setLayoutInfo] = useState({
    layoutPattern: "0 x 0",
    itemsPerRow: 0,
    itemsPerCol: 0
  });

  const drawEnhancedDiePattern = (canvas, config) => {
    if (!canvas) return null;
    
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
  
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  
    const padding = 60;
    const canvasUsableWidth = canvas.width / dpr - 2 * padding;
    const canvasUsableHeight = canvas.height / dpr - 2 * padding;
  
    const scaleX = canvasUsableWidth / config.sheetLength;
    const scaleY = canvasUsableHeight / config.sheetWidth;
    const scale = Math.min(scaleX, scaleY);
  
    const scaledSheetLength = config.sheetLength * scale;
    const scaledSheetWidth = config.sheetWidth * scale;
    const startX = (canvas.width / dpr - scaledSheetLength) / 2;
    const startY = (canvas.height / dpr - scaledSheetWidth) / 2;
  
    // Draw sheet background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(startX, startY, scaledSheetLength, scaledSheetWidth);
  
    // Draw sheet outline dengan gradient border
    const gradient = ctx.createLinearGradient(
      startX,
      startY,
      startX + scaledSheetLength,
      startY + scaledSheetWidth
    );
    gradient.addColorStop(0, "#3b82f6");
    gradient.addColorStop(1, "#1e40af");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.strokeRect(startX, startY, scaledSheetLength, scaledSheetWidth);
  
    // Setup dimensions dengan bleed dan grip
    const bleed = 0.0; 
    const grip = 0.0;  
    
    // 🔧 PERBAIKAN UTAMA: Apply orientation dari awal yang benar
    let currItemL, currItemW;
    
    if (config.orientation === "rotated") {
      // Jika rotated, item width menjadi length (horizontal) dan item length menjadi width (vertikal)
      currItemL = config.itemWidth + bleed;  // Yang horizontal (sepanjang sheet length)
      currItemW = config.itemLength + bleed; // Yang vertikal (sepanjang sheet width)
    } else {
      // Normal orientation
      currItemL = config.itemLength + bleed; // Yang horizontal
      currItemW = config.itemWidth + bleed;  // Yang vertikal  
    }
  
    // 🔧 PERBAIKAN: Sheet dimensions yang benar
    const usableSheetL = config.sheetLength - grip; // Horizontal space - grip
    const usableSheetW = config.sheetWidth;         // Vertical space (full)
    
    // 🔧 PERBAIKAN: Hitung layout dengan benar
    // itemsPerRow = berapa item secara horizontal (sepanjang length)
    // itemsPerCol = berapa item secara vertikal (sepanjang width)
    const maxItemsPerRow = Math.floor(usableSheetL / currItemL);
    const maxItemsPerCol = Math.floor(usableSheetW / currItemW);
    
    console.log("=== DEBUG LAYOUT CALCULATION (FIXED) ===");
    console.log("Sheet dimensions:", config.sheetLength, "x", config.sheetWidth);
    console.log("Item original:", config.itemLength, "x", config.itemWidth);
    console.log("Orientation:", config.orientation);
    console.log("Item after orientation + bleed:", currItemL, "x", currItemW);
    console.log("Usable sheet space:", usableSheetL, "x", usableSheetW);
    console.log("Max items per row (horizontal):", maxItemsPerRow);
    console.log("Max items per col (vertical):", maxItemsPerCol);
    console.log("Max total items possible:", maxItemsPerRow * maxItemsPerCol);
    console.log("Target items:", config.itemsPerSheet);
    
    // Cari layout terbaik yang bisa memuat itemsPerSheet
    let bestLayout = { rows: 0, cols: 0, totalItems: 0, efficiency: 0 };
    
    // Coba berbagai kombinasi layout
    for (let cols = 1; cols <= maxItemsPerRow; cols++) {
      for (let rows = 1; rows <= maxItemsPerCol; rows++) {
        const totalItems = cols * rows;
        if (totalItems >= config.itemsPerSheet) {
          const spaceUsed = (cols * currItemL * rows * currItemW);
          const totalUsableSpace = usableSheetL * usableSheetW;
          const efficiency = (spaceUsed / totalUsableSpace) * 100;
          
          if (efficiency > bestLayout.efficiency || 
              (efficiency === bestLayout.efficiency && totalItems < bestLayout.totalItems)) {
            bestLayout = { rows, cols, totalItems, efficiency };
          }
        }
      }
    }
    
    // Fallback jika tidak ada layout yang bisa memuat semua items
    if (bestLayout.totalItems === 0) {
      bestLayout.cols = maxItemsPerRow;
      bestLayout.rows = maxItemsPerCol;
      bestLayout.totalItems = maxItemsPerRow * maxItemsPerCol;
    }
    
    const itemsPerRow = bestLayout.cols;  // Horizontal
    const itemsPerCol = bestLayout.rows;  // Vertical
    const actualItemsToShow = Math.min(config.itemsPerSheet, bestLayout.totalItems);
    
    console.log("Final layout:", itemsPerRow, "cols x", itemsPerCol, "rows =", bestLayout.totalItems, "items");
    console.log("Will show:", actualItemsToShow, "items");
    
    // Scale untuk drawing
    const scaledItemL = currItemL * scale;
    const scaledItemW = currItemW * scale;
    
    // Draw gripper margin area
    ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
    ctx.fillRect(
      startX + usableSheetL * scale,
      startY,
      grip * scale,
      scaledSheetWidth
    );
  
    // Label gripper area
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "Gripper",
      startX + usableSheetL * scale + (grip * scale) / 2,
      startY + 15
    );
    
    // 🔧 PERBAIKAN: Draw items dengan orientasi yang benar
    let itemCount = 1;
    for (let row = 0; row < itemsPerCol && itemCount <= actualItemsToShow; row++) {
      for (let col = 0; col < itemsPerRow && itemCount <= actualItemsToShow; col++) {
        const x = startX + col * scaledItemL;
        const y = startY + row * scaledItemW;
  
        // Draw item background dengan gradient
        const itemGrad = ctx.createLinearGradient(
          x,
          y,
          x + scaledItemL,
          y + scaledItemW
        );
        itemGrad.addColorStop(0, "rgba(59, 130, 246, 0.4)");
        itemGrad.addColorStop(1, "rgba(29, 78, 216, 0.6)");
        ctx.fillStyle = itemGrad;
        ctx.fillRect(x, y, scaledItemL, scaledItemW);
  
        // Draw item border
        ctx.strokeStyle = "#1e40af";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, scaledItemL, scaledItemW);
  
        // Draw bleed area (dashed line)
        const bleedPx = bleed * scale;
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(
          x + bleedPx / 2,
          y + bleedPx / 2,
          scaledItemL - bleedPx,
          scaledItemW - bleedPx
        );
        ctx.setLineDash([]);
  
        // Draw item number
        if (scaledItemL > 40 && scaledItemW > 25) {
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${Math.min(
            scaledItemL / 8,
            scaledItemW / 6,
            14
          )}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(itemCount, x + scaledItemL / 2, y + scaledItemW / 2);
        }
        itemCount++;
      }
    }
  
    // Draw waste areas
    const rightWaste = scaledSheetLength - itemsPerRow * scaledItemL - grip * scale;
    if (rightWaste > 0) {
      ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
      ctx.fillRect(
        startX + itemsPerRow * scaledItemL,
        startY,
        rightWaste,
        itemsPerCol * scaledItemW
      );
    }
    
    const bottomWaste = scaledSheetWidth - itemsPerCol * scaledItemW;
    if (bottomWaste > 0) {
      ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
      ctx.fillRect(
        startX,
        startY + itemsPerCol * scaledItemW,
        scaledSheetLength - grip * scale,
        bottomWaste
      );
    }
  
    // Draw efficiency badge
    const effVal = parseFloat(config.efficiency);
    const effColor = effVal > 85 ? "#10b981" : effVal > 70 ? "#f59e0b" : "#ef4444";
    ctx.fillStyle = effColor;
    ctx.fillRect(startX + scaledSheetLength - 100, startY + 10, 90, 30);
    ctx.fillStyle = "white";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${config.efficiency}%`, startX + scaledSheetLength - 55, startY + 25);
    ctx.font = "10px sans-serif";
    ctx.fillText("Efficiency", startX + scaledSheetLength - 55, startY + 35);
  
    // Draw dimension labels
    ctx.fillStyle = "#1f2937";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    
    ctx.fillText(
      `${config.sheetLength.toFixed(1)}cm`, 
      startX + scaledSheetLength / 2, 
      startY + scaledSheetWidth + 35
    );
  
    ctx.save();
    ctx.translate(startX - 35, startY + scaledSheetWidth / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${config.sheetWidth.toFixed(1)}cm`, 0, 0);
    ctx.restore();
  
    // Return layout info yang benar
    return {
      layoutPattern: `${itemsPerRow} x ${itemsPerCol}`,
      itemsPerRow: itemsPerRow,
      itemsPerCol: itemsPerCol,
      maxPossibleItems: bestLayout.totalItems,
      actualItemsShown: actualItemsToShow
    };
  };

  useEffect(() => {
    if (
      sheetLength &&
      sheetWidth &&
      itemLength &&
      itemWidth &&
      typeof orientation !== "undefined" &&
      efficiency !== null &&
      itemsPerSheet !== null
    ) {
      const config = {
        sheetLength,
        sheetWidth,
        itemLength,
        itemWidth,
        orientation,
        efficiency,
        itemsPerSheet,
        layoutType,
        materialUsage,
      };

      const result = drawEnhancedDiePattern(canvasRef.current, config);
      if (result) {
        setLayoutInfo(result);
      }
    }
  }, [
    sheetLength,
    sheetWidth,
    itemLength,
    itemWidth,
    orientation,
    efficiency,
    itemsPerSheet,
    layoutType,
    materialUsage,
  ]);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Enhanced Die Pattern Visualization
      </h3>
      <canvas
        ref={canvasRef}
        className="w-full h-[300px] md:h-[400px] rounded-md shadow-lg"
      />
      <div className="mt-4 p-4 bg-gray-50 rounded-md text-gray-700 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-gray-800 mb-2">
              Layout Details
            </div>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Items Fitted:</span>{" "}
                {layoutInfo?.actualItemsShown || itemsPerSheet || 0}
              </div>
              <div>
                <span className="font-medium">Orientation:</span>{" "}
                {orientation === "rotated" ? "Rotated" : "Normal"}
              </div>
              <div>
                <span className="font-medium">Layout:</span>{" "}
                {layoutInfo?.layoutPattern || "0 x 0"}
              </div>
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-800 mb-2">
              Material Info
            </div>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Material Usage:</span>{" "}
                {efficiency || 0}%
              </div>
              <div>
                <span className="font-medium">Bleed Allowance:</span> 3mm
              </div>
              <div>
                <span className="font-medium">Gripper Margin:</span> 10mm
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}