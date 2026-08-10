export function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** value is a decimal fraction (0.24 = 24%), matching calculations.ts's ROI functions. */
export function percent(value: number): string {
  return `${(value * 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
}
