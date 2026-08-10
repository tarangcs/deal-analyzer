// Plain-English field help, sourced verbatim from the "Definitions" tab of
// deal-analyzer-worksheet.xlsx so we don't have to write new copy.
export const FIELD_DEFINITIONS = {
  evaluatorName: "Name of the evaluator.",
  propertyAddress: "The address of the property you want to analyze.",
  squareFootage:
    "The total square footage of the entire interior of the property.",
  description:
    "Key details and attributes about the property including differentiators, # of garage spaces, levels, layout, property type, etc.",
  arv: 'Value of the property after all repairs have been made regardless of purchase price. Also known as "Fair Market Value."',
  asIsValue:
    "Value of the property in current \"as is\" condition. Not factoring repairs needed.",
  repairCost: "The dollar amount of estimated repairs based on your analysis.",
  purchasePrice: "The dollar amount you plan to purchase the property for.",
  holdMonths:
    "Estimated number of months you plan to own the property from purchase date to close of escrow sale date.",
  miscFinancingCosts: "Any custom costs related to financing.",
} as const satisfies Record<string, string>;

// Same "amount / points / interest rate" shape repeats for each of the
// three loan slots in the Financing Costs section — definitions sourced
// from the xlsx's per-position (1st/2nd/misc) Definitions rows.
export const LOAN_DEFINITIONS = {
  firstMortgage: {
    amount:
      "The 1st position loan amount borrowed to purchase the property and / or fund the rehab.",
    points:
      "The 1st position points charged as a % of mortgage lien amount. 1 point = 1% in calculation.",
    interestRate:
      "The 1st position interest rate for the amount borrowed to purchase the property and / or fund the rehab.",
  },
  secondMortgage: {
    amount:
      "The 2nd position loan amount borrowed to purchase the property and / or fund the rehab.",
    points:
      "The 2nd position points charged as a % of mortgage lien amount. 1 point = 1% in calculation.",
    interestRate:
      "The 2nd position interest rate for the amount borrowed to purchase the property and / or fund the rehab.",
  },
  miscMortgage: {
    amount:
      "The misc. position loan amount borrowed to purchase the property and/or fund the rehab.",
    points:
      "The misc. position points charged as a % of mortgage lien amount. 1 point = 1% in calculation.",
    interestRate:
      "The misc. position interest rate for the amount borrowed to purchase the property and/or fund the rehab.",
  },
} as const satisfies Record<string, Record<"amount" | "points" | "interestRate", string>>;
