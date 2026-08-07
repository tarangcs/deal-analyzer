import type { PropertyInfo } from "./types";

type FieldErrors = Partial<Record<keyof PropertyInfo, string>>;

const REQUIRED_FIELDS = [
  "evaluatorName",
  "propertyAddress",
  "squareFootage",
  "arv",
  "purchasePrice",
  "repairCost",
  "holdMonths",
] as const satisfies readonly (keyof PropertyInfo)[];

const NON_NEGATIVE_NUMBER_FIELDS = [
  "squareFootage",
  "units",
  "arv",
  "asIsValue",
  "repairCost",
  "purchasePrice",
  "holdMonths",
] as const satisfies readonly (keyof PropertyInfo)[];

export function validatePropertyInfo(info: PropertyInfo): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of REQUIRED_FIELDS) {
    const value = info[field];
    if (value === "" || value === null || value === undefined) {
      errors[field] = "Required";
    }
  }

  for (const field of NON_NEGATIVE_NUMBER_FIELDS) {
    const value = info[field];
    if (typeof value === "number" && value < 0) {
      errors[field] = "Must be zero or more";
    }
  }

  return errors;
}
