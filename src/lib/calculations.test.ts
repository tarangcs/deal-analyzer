import { describe, expect, it } from "vitest";
import { purchaseRepairTotal } from "./calculations";

// Golden fixture: 123 Main St, Cleveland OH (see CLAUDE.md).
describe("purchaseRepairTotal", () => {
  it("matches the xlsx sample deal", () => {
    expect(purchaseRepairTotal(10_000, 175_000)).toBe(185_000);
  });
});
