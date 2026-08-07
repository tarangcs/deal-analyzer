import { describe, expect, it } from "vitest";
import { EMPTY_PROPERTY_INFO } from "./types";
import { validatePropertyInfo } from "./validation";

describe("validatePropertyInfo", () => {
  it("flags required fields left empty", () => {
    const errors = validatePropertyInfo(EMPTY_PROPERTY_INFO);
    expect(errors.propertyAddress).toBe("Required");
    expect(errors.arv).toBe("Required");
    expect(errors.purchasePrice).toBe("Required");
    expect(errors.repairCost).toBe("Required");
  });

  it("flags negative numbers", () => {
    const errors = validatePropertyInfo({
      ...EMPTY_PROPERTY_INFO,
      propertyAddress: "123 Main St",
      evaluatorName: "Jordan",
      squareFootage: 1650,
      arv: 250_000,
      purchasePrice: 175_000,
      repairCost: -10,
      holdMonths: 2,
    });
    expect(errors.repairCost).toBe("Must be zero or more");
  });

  it("passes on a fully valid sample deal", () => {
    const errors = validatePropertyInfo({
      ...EMPTY_PROPERTY_INFO,
      propertyAddress: "123 Main St, Cleveland, OH 44113",
      evaluatorName: "Jordan",
      squareFootage: 1650,
      arv: 250_000,
      purchasePrice: 175_000,
      repairCost: 10_000,
      holdMonths: 2,
    });
    expect(errors).toEqual({});
  });
});
