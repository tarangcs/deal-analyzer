import { describe, expect, it } from "vitest";
import {
  loanInterestCost,
  loanPointsCost,
  purchaseRepairTotal,
  totalFinancingCosts,
} from "./calculations";
import type { MortgageLoan } from "./types";

// Golden fixture: 123 Main St, Cleveland OH (see CLAUDE.md).
describe("purchaseRepairTotal", () => {
  it("matches the xlsx sample deal", () => {
    expect(purchaseRepairTotal(10_000, 175_000)).toBe(185_000);
  });
});

describe("loanPointsCost", () => {
  it("matches the xlsx sample deal's first mortgage", () => {
    expect(loanPointsCost(130_000, 2)).toBe(2_600);
  });
});

describe("loanInterestCost", () => {
  it("matches the xlsx sample deal's first mortgage over a 2-month hold", () => {
    expect(loanInterestCost(130_000, 12, 2)).toBeCloseTo(2_600, 2);
  });
  it("matches the xlsx sample deal's second mortgage over a 2-month hold", () => {
    expect(loanInterestCost(25_000, 4, 2)).toBeCloseTo(166.67, 2);
  });
});

describe("totalFinancingCosts", () => {
  it("matches the xlsx sample deal's $6,266.67 total", () => {
    const loans: MortgageLoan[] = [
      { amount: 130_000, points: 2, interestRate: 12 },
      { amount: 25_000, points: 2, interestRate: 4 },
      { amount: 10_000, points: 2, interestRate: 12 },
    ];
    expect(totalFinancingCosts(loans, 0, 2)).toBeCloseTo(6_266.67, 2);
  });
});
