export const DEAL_STATUSES = [
  "New",
  "Under Contract",
  "Passed",
  "Closed",
] as const;

export type DealStatus = (typeof DEAL_STATUSES)[number];

// Fields captured in the Property + Pricing section (roadmap Step 2).
// Later steps (financing, holding, buying/selling costs) extend the deal
// with their own sections rather than growing this interface.
export interface PropertyInfo {
  evaluatorName: string;
  date: string; // ISO yyyy-mm-dd
  propertyAddress: string;
  squareFootage: number | "";
  units: number | "";
  occupied: boolean;
  description: string;
  status: DealStatus;
  arv: number | "";
  asIsValue: number | "";
  repairCost: number | "";
  purchasePrice: number | "";
  holdMonths: number | "";
}

export const EMPTY_PROPERTY_INFO: PropertyInfo = {
  evaluatorName: "",
  date: new Date().toISOString().slice(0, 10),
  propertyAddress: "",
  squareFootage: "",
  units: 1,
  occupied: false,
  description: "",
  status: "New",
  arv: "",
  asIsValue: "",
  repairCost: "",
  purchasePrice: "",
  holdMonths: 3, // spec default
};

// One mortgage/lien slot (roadmap Step 3: up to 3 — first, second, misc).
// interestRate is stored as a percent as typed (e.g. 12 for 12%), not a
// decimal, to match how points are entered.
export interface MortgageLoan {
  amount: number | "";
  points: number | "";
  interestRate: number | "";
}

export const EMPTY_MORTGAGE_LOAN: MortgageLoan = {
  amount: "",
  points: "",
  interestRate: "",
};

export interface FinancingCosts {
  firstMortgage: MortgageLoan;
  secondMortgage: MortgageLoan;
  miscMortgage: MortgageLoan;
  miscFinancingCosts: number | "";
}

export const EMPTY_FINANCING_COSTS: FinancingCosts = {
  firstMortgage: { ...EMPTY_MORTGAGE_LOAN },
  secondMortgage: { ...EMPTY_MORTGAGE_LOAN },
  miscMortgage: { ...EMPTY_MORTGAGE_LOAN },
  miscFinancingCosts: "",
};

// Holding Costs (roadmap Step 4). Taxes/insurance are entered as annual
// figures (matching the xlsx) and converted to monthly in calculations.ts;
// everything else is entered directly as a monthly figure.
export interface HoldingCosts {
  annualPropertyTaxes: number | "";
  monthlyHoaFees: number | "";
  annualInsurance: number | "";
  monthlyGas: number | "";
  monthlyWater: number | "";
  monthlyElectricity: number | "";
  monthlyMiscUtilities: number | "";
  miscHoldingCosts: number | "";
}

export const EMPTY_HOLDING_COSTS: HoldingCosts = {
  annualPropertyTaxes: "",
  monthlyHoaFees: "",
  annualInsurance: "",
  monthlyGas: "",
  monthlyWater: "",
  monthlyElectricity: "",
  monthlyMiscUtilities: "",
  miscHoldingCosts: "",
};

// Buying Transaction Costs (roadmap Step 5). Title insurance follows the
// xlsx formula: a fixed $500 base + a % of purchase price.
export interface BuyingCosts {
  escrowAttorneyFees: number | "";
  titleInsurancePercent: number | "";
  miscBuyingCosts: number | "";
}

export const EMPTY_BUYING_COSTS: BuyingCosts = {
  escrowAttorneyFees: "",
  titleInsurancePercent: "",
  miscBuyingCosts: "",
};

// Selling Transaction Costs (roadmap Step 5). Realtor fees and transfer/
// conveyance fees are both % of ARV, matching the xlsx.
export interface SellingCosts {
  escrowAttorneyFees: number | "";
  recordingFees: number | "";
  realtorFeesPercent: number | "";
  transferConveyancePercent: number | "";
  homeWarranty: number | "";
  stagingCosts: number | "";
  marketingCosts: number | "";
  miscSellingCosts: number | "";
}

export const EMPTY_SELLING_COSTS: SellingCosts = {
  escrowAttorneyFees: "",
  recordingFees: "",
  realtorFeesPercent: "",
  transferConveyancePercent: "",
  homeWarranty: "",
  stagingCosts: "",
  marketingCosts: "",
  miscSellingCosts: "",
};

// Combined deal draft. Sections beyond these (a full settings panel)
// join this shape in later steps.
export interface Deal {
  property: PropertyInfo;
  financing: FinancingCosts;
  holding: HoldingCosts;
  buying: BuyingCosts;
  selling: SellingCosts;
  // ROI% at/above this is flagged "good" (Deal Summary panel, Step 6).
  // Workshop convention default of 10%, per app-spec.md.
  roiThresholdPercent: number | "";
}

export const EMPTY_DEAL: Deal = {
  property: EMPTY_PROPERTY_INFO,
  financing: EMPTY_FINANCING_COSTS,
  holding: EMPTY_HOLDING_COSTS,
  buying: EMPTY_BUYING_COSTS,
  selling: EMPTY_SELLING_COSTS,
  roiThresholdPercent: 10,
};

// Group-wide defaults (roadmap Step 7), persisted separately from any one
// deal so they apply to every *new* deal going forward — editing settings
// never rewrites a deal already in progress. Percent assumptions (title
// insurance, realtor fees, transfer/conveyance) start unset rather than
// guessing a number, since they vary by market; hold period and ROI
// threshold keep the workshop-convention defaults from app-spec.md.
export interface Settings {
  defaultHoldMonths: number | "";
  defaultRoiThresholdPercent: number | "";
  defaultTitleInsurancePercent: number | "";
  defaultRealtorFeesPercent: number | "";
  defaultTransferConveyancePercent: number | "";
}

export const DEFAULT_SETTINGS: Settings = {
  defaultHoldMonths: 3,
  defaultRoiThresholdPercent: 10,
  defaultTitleInsurancePercent: "",
  defaultRealtorFeesPercent: "",
  defaultTransferConveyancePercent: "",
};

/** A blank deal seeded with the group's current default assumptions. */
export function dealFromSettings(settings: Settings): Deal {
  return {
    ...EMPTY_DEAL,
    property: { ...EMPTY_PROPERTY_INFO, holdMonths: settings.defaultHoldMonths },
    buying: {
      ...EMPTY_BUYING_COSTS,
      titleInsurancePercent: settings.defaultTitleInsurancePercent,
    },
    selling: {
      ...EMPTY_SELLING_COSTS,
      realtorFeesPercent: settings.defaultRealtorFeesPercent,
      transferConveyancePercent: settings.defaultTransferConveyancePercent,
    },
    roiThresholdPercent: settings.defaultRoiThresholdPercent,
  };
}
