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

  // Holding Costs (Step 4)
  annualPropertyTaxes:
    "Use the actual annual property taxes as reported on the county tax assessor's website, or enter an estimate.",
  monthlyHoaFees:
    "The Home Owner Association fees typically charged monthly.",
  annualInsurance:
    "The annual insurance premium for the property during the hold period. Vacant properties typically cost more to insure than occupied ones.",
  monthlyUtilities: "Combined value for gas, electricity, and water utilities.",
  miscHoldingCosts: "Any custom costs related to holding the property.",

  // Buying Transaction Costs (Step 5)
  escrowAttorneyFeesBuying:
    "Fees charged by attorney or escrow company at closing. Typically a % of sale price.",
  titleInsurancePercent:
    "Policy to insure clear and marketable title. Changes based on area, type of policy, underwriter.",
  miscBuyingCosts: "Any custom costs related to buying transactions.",

  // Selling Transaction Costs (Step 5)
  escrowAttorneyFeesSelling:
    "Fees charged by attorney or escrow company at closing. Typically a % of sale price.",
  recordingFees:
    "Fees taken from the HUD-1 county recorder's fees charged by the escrow company.",
  realtorFeesPercent: "Commissions paid to realtors involved in the transaction.",
  transferConveyancePercent:
    "For the transfer of land, charged by the county from seller to buyer. Typically a % of the land value based on county assessor valuation.",
  homeWarranty:
    "Offers protection for mechanical systems and attached appliances against unexpected repairs not covered by homeowner's insurance; coverage extends over a specific time period and does not cover the home's structure.",
  stagingCosts: "Cost for getting the property ready to sell by bringing in home furnishings.",
  marketingCosts:
    "Costs related to offline and online advertising, printing, and promotion to help sell the property.",
  miscSellingCosts: "Any custom costs related to selling transactions.",

  // Deal Summary & ROI (Step 6)
  estimatedNetProfit:
    "Difference between the revenue and expenses of the entire project before income taxes.",
  costPerSqFt:
    "Total purchase + rehab estimate costs divided by total square feet of the property, used as a market indicator.",
  downPaymentRequired: "Amount required by you at closing.",
  committedCapital:
    "Amount of your own money out of pocket that you put in the deal as the purchaser.",
  purchaseRehabROI:
    "% return earned based on purchase + rehab costs, regardless of how long the property was held.",
  estimatedROI:
    "% return earned based on purchase + all costs, regardless of how long the property was held.",
  roiThreshold:
    "The ROI% at or above which a deal is flagged as good. Adjustable — set it to whatever your group considers a worthwhile deal.",
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
