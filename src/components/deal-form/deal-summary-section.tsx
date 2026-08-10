import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { summarizeDeal } from "@/lib/calculations";
import { FIELD_DEFINITIONS } from "@/lib/definitions";
import type { DealQuality } from "@/lib/calculations";
import type { Deal } from "@/lib/types";
import { FieldLabel } from "./field-label";
import { NumberField } from "./number-field";

const QUALITY_STYLES: Record<DealQuality, { label: string; className: string }> = {
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

function money(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function percent(decimal: number) {
  return `${(decimal * 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
}

function Stat({
  label,
  value,
  definition,
}: {
  label: string;
  value: string;
  definition?: string;
}) {
  return (
    <div className="space-y-1">
      <FieldLabel label={label} definition={definition} />
      <p className="text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

export function DealSummarySection({
  deal,
  onRoiThresholdChange,
}: {
  deal: Deal;
  onRoiThresholdChange: (value: number | "") => void;
}) {
  const summary = summarizeDeal(deal);
  const qualityStyle = QUALITY_STYLES[summary.quality];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Summary &amp; ROI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
          <div>
            <FieldLabel
              label="Estimated Net Profit"
              definition={FIELD_DEFINITIONS.estimatedNetProfit}
            />
            <p className="text-3xl font-semibold tracking-tight">
              {money(summary.netProfit)}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-sm font-medium ${qualityStyle.className}`}
          >
            {qualityStyle.label} · {percent(summary.roi)} ROI
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Stat
            label="Purchase + Rehab Cost / Sq Ft"
            value={money(summary.costPerSqFt)}
            definition={FIELD_DEFINITIONS.costPerSqFt}
          />
          <Stat
            label="Down Payment Required"
            value={money(summary.downPayment)}
            definition={FIELD_DEFINITIONS.downPaymentRequired}
          />
          <Stat
            label="My Committed Capital"
            value={money(summary.committedCapital)}
            definition={FIELD_DEFINITIONS.committedCapital}
          />
          <Stat
            label="Purchase + Rehab ROI"
            value={percent(summary.rehabRoi)}
            definition={FIELD_DEFINITIONS.purchaseRehabROI}
          />
          <Stat
            label="Estimated ROI (fully loaded)"
            value={percent(summary.roi)}
            definition={FIELD_DEFINITIONS.estimatedROI}
          />
        </div>

        <div className="max-w-xs border-t border-border pt-4">
          <NumberField
            id="roiThresholdPercent"
            label="ROI Threshold for a Good Deal"
            definition={FIELD_DEFINITIONS.roiThreshold}
            value={deal.roiThresholdPercent}
            onChange={onRoiThresholdChange}
            suffix="%"
          />
        </div>
      </CardContent>
    </Card>
  );
}
