// Pure money-math functions, no React/UI dependency. Checked against the
// golden fixture in CLAUDE.md (123 Main St, Cleveland OH) to the cent.

/** xlsx row 20: PURCHASE and REPAIR COSTS = repair cost + purchase price. */
export function purchaseRepairTotal(
  repairCost: number,
  purchasePrice: number,
): number {
  return repairCost + purchasePrice;
}
