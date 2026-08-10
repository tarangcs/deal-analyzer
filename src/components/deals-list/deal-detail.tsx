import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { summarizeDeal } from "@/lib/calculations";
import { toFullDeal, type DealRecord } from "@/lib/backend";
import { QUALITY_STYLES } from "@/lib/deal-quality-styles";
import { money, percent } from "@/lib/format";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function DealDetail({
  record,
  onBack,
}: {
  record: DealRecord;
  onBack: () => void;
}) {
  const deal = toFullDeal(record);
  const summary = summarizeDeal(deal);
  const qualityStyle = QUALITY_STYLES[summary.quality];
  const loans = [
    { label: "First Mortgage", loan: deal.financing.firstMortgage },
    { label: "Second Mortgage", loan: deal.financing.secondMortgage },
    { label: "Misc. Mortgage", loan: deal.financing.miscMortgage },
  ].filter(({ loan }) => loan.amount !== "" && loan.amount !== 0);

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack}>
        ← Back to Deals
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{record.propertyAddress || "(no address)"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Evaluated by {record.evaluatorName || "—"} · {record.status || "—"}
              </p>
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

          {deal.property.description && (
            <p className="text-sm text-muted-foreground">
              {deal.property.description}
            </p>
          )}

          <div>
            <h3 className="mb-1 text-sm font-medium">Property</h3>
            <Row label="Square Footage" value={`${deal.property.squareFootage || "—"} sq ft`} />
            <Row label="Units" value={String(deal.property.units || "—")} />
            <Row label="Occupied" value={deal.property.occupied ? "Yes" : "No"} />
            <Row label="After Repair Value" value={money(Number(deal.property.arv) || 0)} />
            <Row label="As-Is Value" value={money(Number(deal.property.asIsValue) || 0)} />
            <Row label="Repair Cost" value={money(Number(deal.property.repairCost) || 0)} />
            <Row label="Purchase Price" value={money(Number(deal.property.purchasePrice) || 0)} />
            <Row label="Hold Period" value={`${deal.property.holdMonths || 0} months`} />
          </div>

          {loans.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-medium">Financing</h3>
              {loans.map(({ label, loan }) => (
                <Row
                  key={label}
                  label={label}
                  value={`${money(Number(loan.amount) || 0)} @ ${loan.points || 0} pts, ${loan.interestRate || 0}%`}
                />
              ))}
            </div>
          )}

          <div>
            <h3 className="mb-1 text-sm font-medium">Deal Summary</h3>
            <Row label="Purchase + Rehab Cost / Sq Ft" value={money(summary.costPerSqFt)} />
            <Row label="Down Payment Required" value={money(summary.downPayment)} />
            <Row label="My Committed Capital" value={money(summary.committedCapital)} />
            <Row label="Purchase + Rehab ROI" value={percent(summary.rehabRoi)} />
            <Row label="Estimated ROI (fully loaded)" value={percent(summary.roi)} />
          </div>

          {record.notes && (
            <div>
              <h3 className="mb-1 text-sm font-medium">Notes</h3>
              <p className="text-sm text-muted-foreground">{record.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
