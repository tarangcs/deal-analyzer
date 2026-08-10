import type { DealQuality } from "./calculations";

export const QUALITY_STYLES: Record<DealQuality, { label: string; className: string }> = {
  good: {
    label: "Good deal",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  },
  marginal: {
    label: "Marginal",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  },
  poor: {
    label: "Poor deal",
    className:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900",
  },
};
