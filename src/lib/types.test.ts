import { describe, expect, it } from "vitest";
import { dealFromSettings, EMPTY_DEAL, type Settings } from "./types";

describe("dealFromSettings", () => {
  it("seeds a fresh deal with the group's defaults", () => {
    const settings: Settings = {
      defaultHoldMonths: 4,
      defaultRoiThresholdPercent: 15,
      defaultTitleInsurancePercent: 0.3,
      defaultRealtorFeesPercent: 2.5,
      defaultTransferConveyancePercent: 0.1,
    };
    const deal = dealFromSettings(settings);
    expect(deal.property.holdMonths).toBe(4);
    expect(deal.roiThresholdPercent).toBe(15);
    expect(deal.buying.titleInsurancePercent).toBe(0.3);
    expect(deal.selling.realtorFeesPercent).toBe(2.5);
    expect(deal.selling.transferConveyancePercent).toBe(0.1);
  });

  it("leaves every other field blank, same as an empty deal", () => {
    const settings: Settings = {
      defaultHoldMonths: 3,
      defaultRoiThresholdPercent: 10,
      defaultTitleInsurancePercent: "",
      defaultRealtorFeesPercent: "",
      defaultTransferConveyancePercent: "",
    };
    const deal = dealFromSettings(settings);
    expect(deal.property.evaluatorName).toBe(EMPTY_DEAL.property.evaluatorName);
    expect(deal.property.arv).toBe("");
    expect(deal.financing).toEqual(EMPTY_DEAL.financing);
    expect(deal.holding).toEqual(EMPTY_DEAL.holding);
  });
});
