export const SideBarLinks = [
  {
    img: "/dashboard.svg",
    route: "/dashboard",
    text: "Home",
  },
  {
    img: "/invoice.svg",
    route: "/dashboard/billing",
    text: "Billing",
  },
  {
    img: "/save.svg",
    route: "/dashboard/quote-management",
    text: "Quote",
  },
];


export const finishingOptionsConfig = [
  { key: "addFolding", label: "Folding" },
  { key: "addFoiling", label: "Foiling" },
  { key: "addEmbossing", label: "Embossing/Debossing" },
  { key: "addUvPrinting", label: "UV Printing" },
];

export const paperSizes = {
  SRA3: { length: 45, width: 32, costMultiplier: 1.0 },
  A3:     { length: 42,   width: 29.7, costMultiplier: 1.2 },
  SRA2:   { length: 64,   width: 45,   costMultiplier: 1.6 },
  Custom: { length: 0,    width: 0,    costMultiplier: 1.1 },
};

export const COST_PER_SIDE_SURCHARGE = 0.05;
export const SETUP_COST            = 0.00;
export const PROFIT_MARGIN         = 0.00; 
export const ADDITION_COSTS = {                        // Finishing per MVP
  foldingPerLinePerSheet: 0.02,                  // $0.02 per fold line / sheet
  foilingPerSheet: 0.15,                        // $0.15 per sheet
  embossingPerSheet: 0.20,                      // $0.20 per sheet
  uvPrintingPerSheet: 0.10,                       // $0.10 per sheet
  laminationPerSheet: 0.10,
  dieCuttingPerSheet: 0.12,
  // (Lamination/die‐cutting omitted; MVP did not specify them)
};
export const RUSH_MULTIPLIERS = {
  standard: 1.00,
  rush:     1.25,
  "same-day": 1.50,
};
export const TIERED_SHEET_PRICING = [
  { maxSheets: 100,  pricePerSheet: 0.50 },      // ≤ 100 sheets: $0.50 each
  { maxSheets: 500,  pricePerSheet: 0.45 },      // ≤ 500 sheets: $0.45 each
  { maxSheets: Infinity, pricePerSheet: 0.40 }   // > 500 sheets: $0.40 each
];
