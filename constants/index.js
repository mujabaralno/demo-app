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

export const COST_PER_SIDE_SURCHARGE = 0.08;
export const SETUP_COST            = 35.00;
export const PROFIT_MARGIN         = 0.35; // 35%
export const ADDITION_COSTS = {
  foldingPerLinePerSheet: 0.03,
  foilingPerSheet:        0.25,
  embossingPerSheet:      0.30,
  uvPrintingPerSheet:     0.15,
  laminationPerSheet:     0.20,
  dieCuttingPerSheet:     0.35,
};
export const RUSH_MULTIPLIERS = {
  standard: 1.00,
  rush:     1.25,
  "same-day": 1.50,
};
export const TIERED_SHEET_PRICING = [
  { maxSheets: 25,   pricePerSheet: 0.75 },
  { maxSheets: 50,   pricePerSheet: 0.68 },
  { maxSheets: 100,  pricePerSheet: 0.62 },
  { maxSheets: 250,  pricePerSheet: 0.58 },
  { maxSheets: 500,  pricePerSheet: 0.54 },
  { maxSheets: 1000, pricePerSheet: 0.50 },
  { maxSheets: 2500, pricePerSheet: 0.47 },
  { maxSheets: Infinity, pricePerSheet: 0.45 },
];