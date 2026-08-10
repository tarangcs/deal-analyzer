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

// Combined deal draft. Sections beyond property/financing (holding,
// buying/selling costs, deal summary) join this shape in later steps.
export interface Deal {
  property: PropertyInfo;
  financing: FinancingCosts;
}

export const EMPTY_DEAL: Deal = {
  property: EMPTY_PROPERTY_INFO,
  financing: EMPTY_FINANCING_COSTS,
};
