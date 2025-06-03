"use client"
import { useRef, useCallback } from 'react';

export const useCanvas = () => {
  const canvasRef = useRef(null);

  const drawDiePattern = useCallback(({
    inputLength,
    inputWidth,
    outputLength,
    outputWidth,
    cardsPerSheet
  }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate scale to fit paper in canvas
    const scaleX = (canvasWidth - 40) / inputLength;
    const scaleY = (canvasHeight - 40) / inputWidth;
    const scale = Math.min(scaleX, scaleY);

    const paperDisplayWidth = inputLength * scale;
    const paperDisplayHeight = inputWidth * scale;
    const offsetX = (canvasWidth - paperDisplayWidth) / 2;
    const offsetY = (canvasHeight - paperDisplayHeight) / 2;

    // Draw paper background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(offsetX, offsetY, paperDisplayWidth, paperDisplayHeight);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, paperDisplayWidth, paperDisplayHeight);

    // Draw items
    const itemDisplayWidth = outputLength * scale;
    const itemDisplayHeight = outputWidth * scale;
    const itemsPerRowLength = Math.floor(inputLength / outputLength);
    const itemsPerRowWidth = Math.floor(inputWidth / outputWidth);

    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 1;

    for (let i = 0; i < itemsPerRowLength; i++) {
      for (let j = 0; j < itemsPerRowWidth; j++) {
        const x = offsetX + (i * itemDisplayWidth);
        const y = offsetY + (j * itemDisplayHeight);
        ctx.fillRect(x, y, itemDisplayWidth, itemDisplayHeight);
        ctx.strokeRect(x, y, itemDisplayWidth, itemDisplayHeight);
      }
    }

    // Draw waste areas
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    
    // Right waste area
    const wasteX = offsetX + (itemsPerRowLength * itemDisplayWidth);
    if (wasteX < offsetX + paperDisplayWidth) {
      ctx.fillRect(wasteX, offsetY, offsetX + paperDisplayWidth - wasteX, paperDisplayHeight);
    }

    // Bottom waste area
    const wasteY = offsetY + (itemsPerRowWidth * itemDisplayHeight);
    if (wasteY < offsetY + paperDisplayHeight) {
      ctx.fillRect(offsetX, wasteY, paperDisplayWidth, offsetY + paperDisplayHeight - wasteY);
    }
  }, []);

  return {
    canvasRef,
    drawDiePattern
  };
};