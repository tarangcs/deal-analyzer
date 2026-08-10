// Pure money-math functions, no React/UI dependency. Checked against the
// golden fixture in CLAUDE.md (123 Main St, Cleveland OH) to the cent.
import type { MortgageLoan } from "./types";

/** Treats an empty form field ("") as 0 for calculation purposes. */
export function numOrZero(value: number | ""): number {
  return typeof value === "number" ? value : 0;
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
