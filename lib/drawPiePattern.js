// drawDiePattern.js
export default function drawDiePattern(
  canvas,
  sheetL,
  sheetW,
  itemL,
  itemW,
  orientation,
  efficiency,
  itemsPerSheet,
  effL,
  effW
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

  const padding = 60;
  const canvasUsableWidth = canvas.width / dpr - 2 * padding;
  const canvasUsableHeight = canvas.height / dpr - 2 * padding;
  const scaleX = canvasUsableWidth / sheetL;
  const scaleY = canvasUsableHeight / sheetW;
  const scale = Math.min(scaleX, scaleY);

  const scaledSheetLength = sheetL * scale;
  const scaledSheetWidth = sheetW * scale;
  const startX = (canvas.width / dpr - scaledSheetLength) / 2;
  const startY = (canvas.height / dpr - scaledSheetWidth) / 2;

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(startX, startY, scaledSheetLength, scaledSheetWidth);

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

  const bleed = 0.3;
  const grip = 1.0;
  let currentItemLength = itemL + bleed;
  let currentItemWidth = itemW + bleed;
  if (orientation === "rotated") {
    [currentItemLength, currentItemWidth] = [
      currentItemWidth,
      currentItemLength,
    ];
  }
  const usableSheetLength = sheetL - grip;
  const usableSheetWidth = sheetW - grip;
  const scaledItemLength = currentItemLength * scale;
  const scaledItemWidth = currentItemWidth * scale;
  const itemsPerRow = Math.floor(usableSheetLength / currentItemLength);
  const itemsPerCol = Math.floor(usableSheetWidth / currentItemWidth);

  ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
  ctx.fillRect(
    startX + usableSheetLength * scale,
    startY,
    grip * scale,
    scaledSheetWidth
  );
  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 10px Inter";
  ctx.textAlign = "center";
  ctx.fillText(
    "Gripper",
    startX + usableSheetLength * scale + (grip * scale) / 2,
    startY + 15
  );

  let drawn = 0;
  for (let row = 0; row < itemsPerCol && drawn < itemsPerSheet; row++) {
    for (let col = 0; col < itemsPerRow && drawn < itemsPerSheet; col++) {
      const x = startX + col * scaledItemLength;
      const y = startY + row * scaledItemWidth;

      const itemGrad = ctx.createLinearGradient(
        x,
        y,
        x + scaledItemLength,
        y + scaledItemWidth
      );
      itemGrad.addColorStop(0, "rgba(59, 130, 246, 0.4)");
      itemGrad.addColorStop(1, "rgba(29, 78, 216, 0.6)");
      ctx.fillStyle = itemGrad;
      ctx.fillRect(x, y, scaledItemLength, scaledItemWidth);

      ctx.strokeStyle = "#1e40af";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, scaledItemLength, scaledItemWidth);

      const bleedScale = bleed * scale;
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(
        x + bleedScale / 2,
        y + bleedScale / 2,
        scaledItemLength - bleedScale,
        scaledItemWidth - bleedScale
      );
      ctx.setLineDash([]);

      const itemNumber = drawn + 1;
      if (scaledItemLength > 40 && scaledItemWidth > 25) {
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.min(
          scaledItemLength / 8,
          scaledItemWidth / 6,
          14
        )}px Inter`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          itemNumber,
          x + scaledItemLength / 2,
          y + scaledItemWidth / 2
        );
      }
      drawn++;
    }
  }

  ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
  const rightWasteWidth =
    scaledSheetLength - itemsPerRow * scaledItemLength - grip * scale;
  if (rightWasteWidth > 0) {
    ctx.fillRect(
      startX + itemsPerRow * scaledItemLength,
      startY,
      rightWasteWidth,
      itemsPerCol * scaledItemWidth
    );
  }
  const bottomWasteHeight = scaledSheetWidth - itemsPerCol * scaledItemWidth;
  if (bottomWasteHeight > 0) {
    ctx.fillRect(
      startX,
      startY + itemsPerCol * scaledItemWidth,
      scaledSheetLength - grip * scale,
      bottomWasteHeight
    );
  }

  const effVal = parseFloat(efficiency);
  const effColor =
    effVal > 85 ? "#10b981" : effVal > 70 ? "#f59e0b" : "#ef4444";
  ctx.fillStyle = effColor;
  ctx.fillRect(startX + scaledSheetLength - 100, startY + 10, 90, 30);
  ctx.fillStyle = "white";
  ctx.font = "bold 12px Inter";
  ctx.textAlign = "center";
  ctx.fillText(`${efficiency}%`, startX + scaledSheetLength - 55, startY + 25);
  ctx.font = "10px Inter";
  ctx.fillText("Efficiency", startX + scaledSheetLength - 55, startY + 35);

  ctx.fillStyle = "#1f2937";
  ctx.font = "12px Inter";
  ctx.textAlign = "center";
  ctx.fillText(
    `${sheetL.toFixed(1)}cm`,
    startX + scaledSheetLength / 2,
    startY + scaledSheetWidth + 30
  );

  ctx.save();
  ctx.translate(startX - 30, startY + scaledSheetWidth / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${sheetW.toFixed(1)}cm`, 0, 0);
  ctx.restore();
}
