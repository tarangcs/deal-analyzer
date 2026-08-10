import { describe, expect, it } from "vitest";
import { withDefaults } from "./deep-merge";

describe("withDefaults", () => {
  it("fills in a top-level section missing from an old draft", () => {
    const defaults = {
      property: { arv: 0 },
      holding: { annualPropertyTaxes: 0 },
    };
    // Simulates a draft saved before the "holding" section existed.
    const stored = { property: { arv: 250_000 } };
    expect(withDefaults(defaults, stored)).toEqual({
      property: { arv: 250_000 },
      holding: { annualPropertyTaxes: 0 },
    });
  });

  it("fills in a field missing from an existing nested section", () => {
    const defaults = { financing: { firstMortgage: { amount: "", points: "" } } };
    const stored = { financing: { firstMortgage: { amount: 130_000 } } };
    expect(withDefaults(defaults, stored)).toEqual({
      financing: { firstMortgage: { amount: 130_000, points: "" } },
    });
  });

  it("falls back to defaults entirely when nothing was ever stored", () => {
    const defaults = { property: { arv: "" } };
    expect(withDefaults(defaults, undefined)).toEqual(defaults);
  });

  it("preserves stored primitive values, including 0 and empty string", () => {
    const defaults = { count: 5, name: "default" };
    const stored = { count: 0, name: "" };
    expect(withDefaults(defaults, stored)).toEqual({ count: 0, name: "" });
  });
});
