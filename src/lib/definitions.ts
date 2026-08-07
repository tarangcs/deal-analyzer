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
} as const satisfies Record<string, string>;
