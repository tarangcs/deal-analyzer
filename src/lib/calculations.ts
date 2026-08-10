// Pure money-math functions, no React/UI dependency. Checked against the
// golden fixture in CLAUDE.md (123 Main St, Cleveland OH) to the cent.
import type { BuyingCosts, Deal, HoldingCosts, MortgageLoan, SellingCosts } from "./types";

/** xlsx C58: fixed base baked into the formula, not a separate input cell. */
const TITLE_INSURANCE_BASE_FEE = 500;

/** Treats an empty form field ("") as 0 for calculation purposes. */
export function numOrZero(value: number | ""): number {
  return typeof value === "number" ? value : 0;
}

/**
 * Like numOrZero, but for values coming back from the Sheet (DealRecord),
 * which can be a blank cell (""), non-numeric text someone typed by hand,
 * or already a number. Never throws, never returns NaN.
 */
export function toNumberLoose(value: number | string): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** xlsx row 20: PURCHASE and REPAIR COSTS = repair cost + purchase price. */
export function purchaseRepairTotal(
  repairCost: number,
  purchasePrice: number,
): number {
  return repairCost + purchasePrice;
}

/** e.g. xlsx C24: points cost = (points / 100) * loan amount. */
export function loanPointsCost(loanAmount: number, points: number): number {
  return (points / 100) * loanAmount;
}

/**
 * e.g. xlsx C25: interest-only cost over the hold period =
 * amount * (annual rate / 12) * months held.
 */
export function loanInterestCost(
  loanAmount: number,
  annualRatePercent: number,
  holdMonths: number,
): number {
  return ((loanAmount * (annualRatePercent / 100)) / 12) * holdMonths;
}

/** xlsx row 39: TOTAL FINANCING COSTS across all loans + misc financing. */
export function totalFinancingCosts(
  loans: MortgageLoan[],
  miscFinancingCosts: number,
  holdMonths: number,
): number {
  const loansTotal = loans.reduce((sum, loan) => {
    const amount = numOrZero(loan.amount);
    const points = numOrZero(loan.points);
    const rate = numOrZero(loan.interestRate);
    return (
      sum + loanPointsCost(amount, points) + loanInterestCost(amount, rate, holdMonths)
    );
  }, 0);
  return loansTotal + miscFinancingCosts;
}

function sumLoanAmounts(loans: MortgageLoan[]): number {
  return loans.reduce((sum, loan) => sum + numOrZero(loan.amount), 0);
}

function sumLoanPointsCosts(loans: MortgageLoan[]): number {
  return loans.reduce(
    (sum, loan) => sum + loanPointsCost(numOrZero(loan.amount), numOrZero(loan.points)),
    0,
  );
}

/** xlsx row 53: TOTAL MONTHLY HOLDING COSTS. Annual taxes/insurance -> monthly. */
export function totalMonthlyHoldingCosts(holding: HoldingCosts): number {
  const monthlyTaxes = numOrZero(holding.annualPropertyTaxes) / 12;
  const monthlyInsurance = numOrZero(holding.annualInsurance) / 12;
  const utilitiesTotal =
    numOrZero(holding.monthlyGas) +
    numOrZero(holding.monthlyWater) +
    numOrZero(holding.monthlyElectricity) +
    numOrZero(holding.monthlyMiscUtilities);
  return (
    monthlyTaxes +
    numOrZero(holding.monthlyHoaFees) +
    monthlyInsurance +
    utilitiesTotal +
    numOrZero(holding.miscHoldingCosts)
  );
}

/** xlsx B81: Total Holding Costs = monthly total x months held. */
export function totalHoldingCosts(
  totalMonthlyHolding: number,
  holdMonths: number,
): number {
  return totalMonthlyHolding * holdMonths;
}

/**
 * xlsx C58: Title Insurance / Search Costs = $500 base + % of purchase
 * price. The base fee only applies once there's a purchase price to
 * insure — otherwise an untouched form shows a phantom $500 cost.
 */
export function titleInsuranceCost(
  purchasePrice: number,
  titleInsurancePercent: number,
): number {
  if (purchasePrice === 0) return 0;
  return TITLE_INSURANCE_BASE_FEE + (titleInsurancePercent / 100) * purchasePrice;
}

/** xlsx row 60: TOTAL BUYING TRANSACTION COSTS. */
export function totalBuyingCosts(buying: BuyingCosts, purchasePrice: number): number {
  return (
    numOrZero(buying.escrowAttorneyFees) +
    titleInsuranceCost(purchasePrice, numOrZero(buying.titleInsurancePercent)) +
    numOrZero(buying.miscBuyingCosts)
  );
}

/** xlsx row 72: TOTAL SELLING TRANSACTION COSTS. Realtor + transfer fees are % of ARV. */
export function totalSellingCosts(selling: SellingCosts, arv: number): number {
  const realtorFees = (numOrZero(selling.realtorFeesPercent) / 100) * arv;
  const transferFees = (numOrZero(selling.transferConveyancePercent) / 100) * arv;
  return (
    numOrZero(selling.escrowAttorneyFees) +
    numOrZero(selling.recordingFees) +
    realtorFees +
    transferFees +
    numOrZero(selling.homeWarranty) +
    numOrZero(selling.stagingCosts) +
    numOrZero(selling.marketingCosts) +
    numOrZero(selling.miscSellingCosts)
  );
}

/** xlsx B85: ESTIMATED NET PROFIT. */
export function estimatedNetProfit(params: {
  arv: number;
  purchasePrice: number;
  repairCost: number;
  totalFinancing: number;
  totalHolding: number;
  totalBuying: number;
  totalSelling: number;
}): number {
  return (
    params.arv -
    params.purchasePrice -
    params.repairCost -
    params.totalFinancing -
    params.totalHolding -
    params.totalBuying -
    params.totalSelling
  );
}

/** xlsx B90: Purchase + Repair Estimate Cost Per Sq. Ft. */
export function purchaseRepairCostPerSqFt(
  purchasePrice: number,
  repairCost: number,
  squareFootage: number,
): number {
  return squareFootage === 0 ? 0 : (purchasePrice + repairCost) / squareFootage;
}

/** xlsx B91: Down Payment Required at Closing. */
export function downPaymentRequired(params: {
  purchasePrice: number;
  totalBuying: number;
  loans: MortgageLoan[];
}): number {
  return (
    params.purchasePrice +
    params.totalBuying +
    sumLoanPointsCosts(params.loans) -
    sumLoanAmounts(params.loans)
  );
}

/**
 * xlsx B92: My Committed Capital. Only staging/marketing/misc-selling costs
 * count here (not escrow/recording/realtor/transfer/warranty) — those are
 * paid from sale proceeds at closing rather than out of pocket during the
 * hold, per the xlsx's own formula.
 */
export function committedCapital(params: {
  purchasePrice: number;
  repairCost: number;
  loans: MortgageLoan[];
  totalHolding: number;
  totalBuying: number;
  stagingCosts: number;
  marketingCosts: number;
  miscSellingCosts: number;
}): number {
  return (
    params.purchasePrice +
    params.repairCost +
    sumLoanPointsCosts(params.loans) +
    params.totalHolding +
    params.totalBuying +
    params.stagingCosts +
    params.marketingCosts +
    params.miscSellingCosts -
    sumLoanAmounts(params.loans)
  );
}

/** xlsx B93: Purchase + Rehab ROI = net profit / (purchase price + repair cost). Returns a decimal fraction (0.24 = 24%). */
export function purchaseRehabROI(
  netProfit: number,
  purchasePrice: number,
  repairCost: number,
): number {
  const base = purchasePrice + repairCost;
  return base === 0 ? 0 : netProfit / base;
}

/** xlsx B95: Estimated ROI = net profit / all-in costs. Returns a decimal fraction. */
export function estimatedROI(netProfit: number, totalCosts: number): number {
  return totalCosts === 0 ? 0 : netProfit / totalCosts;
}

export type DealQuality = "good" | "marginal" | "poor";

/**
 * Green/yellow/red flag against a user-editable ROI threshold (percent).
 * Red: losing money. Yellow: profitable but below the target. Green: at
 * or above target.
 */
export function dealQualityFlag(
  estimatedRoiDecimal: number,
  thresholdPercent: number,
): DealQuality {
  const roiPercent = estimatedRoiDecimal * 100;
  if (roiPercent < 0) return "poor";
  if (roiPercent < thresholdPercent) return "marginal";
  return "good";
}

export interface DealSummary {
  netProfit: number;
  costPerSqFt: number;
  downPayment: number;
  committedCapital: number;
  /** Decimal fraction (0.24 = 24%), matching purchaseRehabROI/estimatedROI. */
  rehabRoi: number;
  /** Decimal fraction (0.24 = 24%). */
  roi: number;
  quality: DealQuality;
}

/**
 * Every Deal Summary & ROI number, computed once from a full Deal. Shared
 * by the summary panel (display) and the save-to-backend payload (Step 9)
 * so both always agree on the same numbers.
 */
export function summarizeDeal(deal: Deal): DealSummary {
  const { property, financing, holding, buying, selling } = deal;
  const purchasePrice = numOrZero(property.purchasePrice);
  const repairCost = numOrZero(property.repairCost);
  const arv = numOrZero(property.arv);
  const holdMonths = numOrZero(property.holdMonths);
  const loans = [financing.firstMortgage, financing.secondMortgage, financing.miscMortgage];

  const totalFinancing = totalFinancingCosts(
    loans,
    numOrZero(financing.miscFinancingCosts),
    holdMonths,
  );
  const totalHolding = totalHoldingCosts(totalMonthlyHoldingCosts(holding), holdMonths);
  const totalBuying = totalBuyingCosts(buying, purchasePrice);
  const totalSelling = totalSellingCosts(selling, arv);

  const netProfit = estimatedNetProfit({
    arv,
    purchasePrice,
    repairCost,
    totalFinancing,
    totalHolding,
    totalBuying,
    totalSelling,
  });

  const costPerSqFt = purchaseRepairCostPerSqFt(
    purchasePrice,
    repairCost,
    numOrZero(property.squareFootage),
  );
  const downPayment = downPaymentRequired({ purchasePrice, totalBuying, loans });
  const capital = committedCapital({
    purchasePrice,
    repairCost,
    loans,
    totalHolding,
    totalBuying,
    stagingCosts: numOrZero(selling.stagingCosts),
    marketingCosts: numOrZero(selling.marketingCosts),
    miscSellingCosts: numOrZero(selling.miscSellingCosts),
  });
  const rehabRoi = purchaseRehabROI(netProfit, purchasePrice, repairCost);
  const totalCosts =
    purchasePrice + repairCost + totalFinancing + totalHolding + totalBuying + totalSelling;
  const roi = estimatedROI(netProfit, totalCosts);
  const quality = dealQualityFlag(roi, numOrZero(deal.roiThresholdPercent));

  return {
    netProfit,
    costPerSqFt,
    downPayment,
    committedCapital: capital,
    rehabRoi,
    roi,
    quality,
  };
}
