import { describe, expect, it } from "vitest";
import { isPartialNumericInput } from "./number-field";

describe("isPartialNumericInput", () => {
  it("treats a trailing decimal point as partial (mid-typing '0.25')", () => {
    expect(isPartialNumericInput("0.")).toBe(true);
    expect(isPartialNumericInput("12.")).toBe(true);
  });
  it("treats a lone minus sign as partial", () => {
    expect(isPartialNumericInput("-")).toBe(true);
  });
  it("does not treat a complete number as partial", () => {
    expect(isPartialNumericInput("0.25")).toBe(false);
    expect(isPartialNumericInput("12")).toBe(false);
    expect(isPartialNumericInput("-5")).toBe(false);
  });
});
