export function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** value is a decimal fraction (0.24 = 24%), matching calculations.ts's ROI functions. */
export function percent(value: number): string {
  return `${(value * 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
}

/** Signed currency delta, e.g. "+$1,234.00" or "-$500.00" (Intl already signs negatives). */
export function moneyDelta(value: number): string {
  return value > 0 ? `+${money(value)}` : money(value);
}
