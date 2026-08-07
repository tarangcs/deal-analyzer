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
