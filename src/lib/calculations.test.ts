import { describe, expect, it } from "vitest";
import {
  committedCapital,
  computeSensitivity,
  dealQualityFlag,
  downPaymentRequired,
  estimatedNetProfit,
  estimatedROI,
  loanInterestCost,
  loanPointsCost,
  purchaseRehabROI,
  purchaseRepairCostPerSqFt,
  purchaseRepairTotal,
  summarizeDeal,
  titleInsuranceCost,
  totalBuyingCosts,
  totalFinancingCosts,
  totalHoldingCosts,
  totalMonthlyHoldingCosts,
  totalSellingCosts,
} from "./calculations";
import {
  EMPTY_DEAL,
  type BuyingCosts,
  type Deal,
  type HoldingCosts,
  type MortgageLoan,
  type SellingCosts,
} from "./types";

// Golden fixture loans, reused across the Step 6 deal-summary tests below.
const GOLDEN_LOANS: MortgageLoan[] = [
  { amount: 130_000, points: 2, interestRate: 12 },
  { amount: 25_000, points: 2, interestRate: 4 },
  { amount: 10_000, points: 2, interestRate: 12 },
];

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
    expect(totalFinancingCosts(GOLDEN_LOANS, 0, 2)).toBeCloseTo(6_266.67, 2);
  });
});

const GOLDEN_HOLDING: HoldingCosts = {
  annualPropertyTaxes: 1_200,
  monthlyHoaFees: 0,
  annualInsurance: 1_050,
  monthlyGas: 75,
  monthlyWater: 75,
  monthlyElectricity: 50,
  monthlyMiscUtilities: 0,
  miscHoldingCosts: 0,
};

describe("totalMonthlyHoldingCosts", () => {
  it("matches the xlsx sample deal's $387.50/mo", () => {
    expect(totalMonthlyHoldingCosts(GOLDEN_HOLDING)).toBeCloseTo(387.5, 2);
  });
});

describe("totalHoldingCosts", () => {
  it("matches the xlsx sample deal's $775 total over a 2-month hold", () => {
    expect(totalHoldingCosts(387.5, 2)).toBeCloseTo(775, 2);
  });
});

const GOLDEN_BUYING: BuyingCosts = {
  escrowAttorneyFees: 900,
  titleInsurancePercent: 0.25,
  miscBuyingCosts: 0,
};

describe("titleInsuranceCost", () => {
  it("matches the xlsx sample deal's $937.50", () => {
    expect(titleInsuranceCost(175_000, 0.25)).toBeCloseTo(937.5, 2);
  });
  it("is $0 with no purchase price, not a phantom $500 base fee", () => {
    expect(titleInsuranceCost(0, 0.25)).toBe(0);
  });
});

describe("totalBuyingCosts", () => {
  it("matches the xlsx sample deal's $1,837.50 total", () => {
    expect(totalBuyingCosts(GOLDEN_BUYING, 175_000)).toBeCloseTo(1_837.5, 2);
  });
});

const GOLDEN_SELLING: SellingCosts = {
  escrowAttorneyFees: 900,
  recordingFees: 500,
  realtorFeesPercent: 3,
  transferConveyancePercent: 0.12,
  homeWarranty: 500,
  stagingCosts: 1_500,
  marketingCosts: 500,
  miscSellingCosts: 0,
};

describe("totalSellingCosts", () => {
  it("matches the xlsx sample deal's $11,700 total", () => {
    expect(totalSellingCosts(GOLDEN_SELLING, 250_000)).toBeCloseTo(11_700, 2);
  });
});

describe("Deal Summary & ROI (golden fixture end-to-end)", () => {
  const totalFinancing = totalFinancingCosts(GOLDEN_LOANS, 0, 2);
  const totalHolding = totalHoldingCosts(totalMonthlyHoldingCosts(GOLDEN_HOLDING), 2);
  const totalBuying = totalBuyingCosts(GOLDEN_BUYING, 175_000);
  const totalSelling = totalSellingCosts(GOLDEN_SELLING, 250_000);

  const netProfit = estimatedNetProfit({
    arv: 250_000,
    purchasePrice: 175_000,
    repairCost: 10_000,
    totalFinancing,
    totalHolding,
    totalBuying,
    totalSelling,
  });

  it("estimated net profit matches $44,420.83", () => {
    expect(netProfit).toBeCloseTo(44_420.83, 2);
  });

  it("cost per sq ft matches $112.12", () => {
    expect(purchaseRepairCostPerSqFt(175_000, 10_000, 1_650)).toBeCloseTo(
      112.12,
      2,
    );
  });

  it("down payment required matches $15,137.50", () => {
    expect(
      downPaymentRequired({
        purchasePrice: 175_000,
        totalBuying,
        loans: GOLDEN_LOANS,
      }),
    ).toBeCloseTo(15_137.5, 2);
  });

  it("committed capital matches $27,912.50", () => {
    expect(
      committedCapital({
        purchasePrice: 175_000,
        repairCost: 10_000,
        loans: GOLDEN_LOANS,
        totalHolding,
        totalBuying,
        stagingCosts: 1_500,
        marketingCosts: 500,
        miscSellingCosts: 0,
      }),
    ).toBeCloseTo(27_912.5, 2);
  });

  it("purchase + rehab ROI matches 24.01%", () => {
    expect(purchaseRehabROI(netProfit, 175_000, 10_000) * 100).toBeCloseTo(
      24.01,
      2,
    );
  });

  it("estimated (fully-loaded) ROI matches 21.61%", () => {
    const totalCosts =
      175_000 + 10_000 + totalFinancing + totalHolding + totalBuying + totalSelling;
    expect(estimatedROI(netProfit, totalCosts) * 100).toBeCloseTo(21.61, 2);
  });

  it("flags a deal quality of good at the default 10% threshold", () => {
    const totalCosts =
      175_000 + 10_000 + totalFinancing + totalHolding + totalBuying + totalSelling;
    const roi = estimatedROI(netProfit, totalCosts);
    expect(dealQualityFlag(roi, 10)).toBe("good");
  });
});

describe("dealQualityFlag", () => {
  it("flags poor when losing money", () => {
    expect(dealQualityFlag(-0.05, 10)).toBe("poor");
  });
  it("flags marginal when profitable but under threshold", () => {
    expect(dealQualityFlag(0.05, 10)).toBe("marginal");
  });
  it("flags good when at or above threshold", () => {
    expect(dealQualityFlag(0.1, 10)).toBe("good");
  });
});

const GOLDEN_DEAL: Deal = {
  ...EMPTY_DEAL,
  property: {
    ...EMPTY_DEAL.property,
    arv: 250_000,
    purchasePrice: 175_000,
    repairCost: 10_000,
    squareFootage: 1_650,
    holdMonths: 2,
  },
  financing: {
    firstMortgage: { amount: 130_000, points: 2, interestRate: 12 },
    secondMortgage: { amount: 25_000, points: 2, interestRate: 4 },
    miscMortgage: { amount: 10_000, points: 2, interestRate: 12 },
    miscFinancingCosts: 0,
  },
  holding: GOLDEN_HOLDING,
  buying: GOLDEN_BUYING,
  selling: GOLDEN_SELLING,
  roiThresholdPercent: 10,
};

describe("summarizeDeal", () => {
  it("matches the golden fixture end-to-end from a full Deal object", () => {
    const summary = summarizeDeal(GOLDEN_DEAL);
    expect(summary.netProfit).toBeCloseTo(44_420.83, 2);
    expect(summary.costPerSqFt).toBeCloseTo(112.12, 2);
    expect(summary.downPayment).toBeCloseTo(15_137.5, 2);
    expect(summary.committedCapital).toBeCloseTo(27_912.5, 2);
    expect(summary.rehabRoi * 100).toBeCloseTo(24.01, 2);
    expect(summary.roi * 100).toBeCloseTo(21.61, 2);
    expect(summary.quality).toBe("good");
  });
});

describe("computeSensitivity", () => {
  it("matches hand-computed ±10% ARV/repair swings for the golden fixture", () => {
    const scenarios = computeSensitivity(GOLDEN_DEAL);
    const byLabel = Object.fromEntries(
      scenarios.map((s) => [s.label, s.netProfit]),
    );

    // ARV also feeds selling costs (realtor 3% + transfer 0.12% of ARV),
    // so the swing isn't a flat ±10% of ARV pass-through to net profit.
    expect(byLabel["ARV −10%"]).toBeCloseTo(20_200.83, 2);
    expect(byLabel["ARV +10%"]).toBeCloseTo(68_640.83, 2);
    // Repair cost doesn't feed any percentage-based cost, so it's a
    // straight ±10% of $10,000 = ±$1,000 relative to the $44,420.83 base.
    expect(byLabel["Repair Cost −10%"]).toBeCloseTo(45_420.83, 2);
    expect(byLabel["Repair Cost +10%"]).toBeCloseTo(43_420.83, 2);
  });
});
