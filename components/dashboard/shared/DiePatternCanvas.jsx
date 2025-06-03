"use client"
import { useRef, useEffect } from "react";

export default function DiePatternCanvas({
  sheetLength,
  sheetWidth,
  itemLength,
  itemWidth,
  orientation,
  efficiency,
  itemsPerSheet,
}) {
  const canvasRef = useRef(null);

  function drawPattern() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    const padding = 60;
    const canvasUsableWidth  = canvas.width / dpr - 2 * padding;
    const canvasUsableHeight = canvas.height / dpr - 2 * padding;

    const scaleX = canvasUsableWidth / sheetLength;
    const scaleY = canvasUsableHeight / sheetWidth;
    const scale = Math.min(scaleX, scaleY);

    const scaledSheetLength = sheetLength * scale;
    const scaledSheetWidth  = sheetWidth * scale;
    const startX = (canvas.width / dpr - scaledSheetLength) / 2;
    const startY = (canvas.height / dpr - scaledSheetWidth) / 2;

    // Draw sheet background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(startX, startY, scaledSheetLength, scaledSheetWidth);

    // Draw sheet outline (gradient border)
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

    // Compute item dims (with bleed)
    const bleed = 0.3;
    const grip  = 1.0;
    let currItemL = itemLength + bleed;
    let currItemW = itemWidth + bleed;
    if (orientation === "rotated") {
      [currItemL, currItemW] = [currItemW, currItemL];
    }

    const usableSheetL = sheetLength - grip;
    const usableSheetW = sheetWidth - grip;
    const scaledItemL = currItemL * scale;
    const scaledItemW = currItemW * scale;
    const itemsPerRow = Math.floor(usableSheetL / currItemL);
    const itemsPerCol = Math.floor(usableSheetW / currItemW);

    // Draw gripper margin
    ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
    ctx.fillRect(
      startX + usableSheetL * scale,
      startY,
      grip * scale,
      scaledSheetWidth
    );
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 10px Inter";
    ctx.textAlign = "center";
    ctx.fillText(
      "Gripper",
      startX + usableSheetL * scale + (grip * scale) / 2,
      startY + 15
    );

    // Draw items in rows/cols
    for (let row = 0; row < itemsPerCol; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const x = startX + col * scaledItemL;
        const y = startY + row * scaledItemW;

        // Background gradient
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

        // Border
        ctx.strokeStyle = "#1e40af";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, scaledItemL, scaledItemW);

        // Bleed area
        const bleedScale = bleed * scale;
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(
          x + bleedScale / 2,
          y + bleedScale / 2,
          scaledItemL - bleedScale,
          scaledItemW - bleedScale
        );
        ctx.setLineDash([]);

        // Label item # if big enough
        const itemNumber = row * itemsPerRow + col + 1;
        if (scaledItemL > 40 && scaledItemW > 25) {
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${Math.min(
            scaledItemL / 8,
            scaledItemW / 6,
            14
          )}px Inter`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(itemNumber, x + scaledItemL / 2, y + scaledItemW / 2);
        }
      }
    }

    // Draw waste areas
    ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
    const rightWasteWidth =
      scaledSheetLength - itemsPerRow * scaledItemL - grip * scale;
    if (rightWasteWidth > 0) {
      ctx.fillRect(
        startX + itemsPerRow * scaledItemL,
        startY,
        rightWasteWidth,
        itemsPerCol * scaledItemW
      );
    }
    const bottomWasteHeight =
      scaledSheetWidth - itemsPerCol * scaledItemW;
    if (bottomWasteHeight > 0) {
      ctx.fillRect(
        startX,
        startY + itemsPerCol * scaledItemW,
        scaledSheetLength - grip * scale,
        bottomWasteHeight
      );
    }

    // Efficiency indicator
    const effVal = parseFloat(efficiency);
    const effColor =
      effVal > 85 ? "#10b981" : effVal > 70 ? "#f59e0b" : "#ef4444";
    ctx.fillStyle = effColor;
    ctx.fillRect(
      startX + scaledSheetLength - 100,
      startY + 10,
      90,
      30
    );
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Inter";
    ctx.textAlign = "center";
    ctx.fillText(`${efficiency}%`, startX + scaledSheetLength - 55, startY + 25);
    ctx.font = "10px Inter";
    ctx.fillText(
      "Efficiency",
      startX + scaledSheetLength - 55,
      startY + 35
    );

    // Dimension labels
    ctx.fillStyle = "#1f2937";
    ctx.font = "12px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(
      `${sheetLength.toFixed(1)}cm`,
      startX + scaledSheetLength / 2,
      startY + scaledSheetWidth + 35
    );
    ctx.save();
    ctx.translate(startX - 35, startY + scaledSheetWidth / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${sheetWidth.toFixed(1)}cm`, 0, 0);
    ctx.restore();
  }

  // Trigger redraw when dependencies change
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
      drawPattern();
    }
  }, [sheetLength, sheetWidth, itemLength, itemWidth, orientation, efficiency, itemsPerSheet]);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Enhanced Die Pattern Visualization
      </h3>
      <canvas
        ref={canvasRef}
        className="w-full h-[300px] md:h-[400px] rounded-md shadow-lg"
      />
      <div id="canvasInfo" className="mt-4 p-4 bg-gray-50 rounded-md text-gray-700 text-sm text-left">
        {/* If nothing drawn yet, show placeholder text */}
        <div className="text-center">
          Calculate an estimate to see the die pattern visualization
        </div>
      </div>
    </div>
  );
}
