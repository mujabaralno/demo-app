import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import {
  TIERED_SHEET_PRICING,
  COST_PER_SIDE_SURCHARGE,
  ADDITION_COSTS,
  RUSH_MULTIPLIERS,
  SETUP_COST
} from "@/constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmployeeId(employeeId) {
  const employeeIdRegex = /^[A-Z0-9]{3,20}$/;
  return employeeIdRegex.test(employeeId);
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function validatePositive(value) {
  const v = parseFloat(value);
  return !isNaN(v) && v > 0;
}

export function getStoredToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function storeToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export function getStoredUser() {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function storeUser(user) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
}



// 3) “Floor division” items‐per‐sheet logic: no bleed/grip for count, only for visualization
export function calculateMaxItemsPerSheet(sheetL, sheetW, itemL, itemW) {
  const countNormal = Math.floor(sheetL / itemL) * Math.floor(sheetW / itemW);
  const countRotated = Math.floor(sheetL / itemW) * Math.floor(sheetW / itemL);

  if (countNormal >= countRotated) {
    return { count: countNormal, orientation: 'normal', effL: itemL, effW: itemW };
  } else {
    return { count: countRotated, orientation: 'rotated', effL: itemW, effW: itemL };
  }
}



// 5) Material efficiency (for canvas info)
export function calculateMaterialEfficiency(sheetL, sheetW, itemL, itemW, itemsPerSheet) {
  const bleed = 0.3;
  const grip = 1.0;
  const usableArea = (sheetL - grip) * (sheetW - grip);
  const itemArea = (itemL + bleed) * (itemW + bleed);
  const usedArea = itemsPerSheet * itemArea;
  const efficiency = (usedArea / usableArea) * 100;
  return {
    efficiency: efficiency.toFixed(1),
    wasteArea: (usableArea - usedArea).toFixed(1),
  }
}

// 6) Production time (same as before)
export function calculateProductionTime(totalSheets, printSides, hasAdditions, jobType, rushLevel) {
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
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + days);
  return {
    hours: Math.ceil(hours),
    days,
    delivery: deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  };
}

// 7) Utility to format USD
export function formatUSD(val) {
  return 'USD $' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
