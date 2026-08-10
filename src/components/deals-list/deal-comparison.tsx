import { Button } from "@/components/ui/button";
import { toFullDeal, type DealRecord } from "@/lib/backend";
import { summarizeDeal } from "@/lib/calculations";
import { QUALITY_STYLES } from "@/lib/deal-quality-styles";
import { money, percent } from "@/lib/format";

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-4 py-2 text-sm">{children}</td>;
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-muted-foreground">
      {children}
    </th>
  );
}

export function DealComparison({
  records,
  onBack,
}: {
  records: DealRecord[];
  onBack: () => void;
}) {
  const rows = records.map((record) => ({
    record,
    deal: toFullDeal(record),
    summary: summarizeDeal(toFullDeal(record)),
  }));

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack}>
        ← Back to Deals
      </Button>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <HeaderCell>{""}</HeaderCell>
              {rows.map(({ record }) => (
                <HeaderCell key={record.id}>
                  {record.propertyAddress || "(no address)"}
                </HeaderCell>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <Cell>Evaluator</Cell>
              {rows.map(({ record }) => (
                <Cell key={record.id}>{record.evaluatorName || "—"}</Cell>
              ))}
            </tr>
            <tr>
              <Cell>Status</Cell>
              {rows.map(({ record }) => (
                <Cell key={record.id}>{record.status || "—"}</Cell>
              ))}
            </tr>
            <tr>
              <Cell>Quality</Cell>
              {rows.map(({ record, summary }) => {
                const style = QUALITY_STYLES[summary.quality];
                return (
                  <Cell key={record.id}>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.className}`}
                    >
                      {style.label}
                    </span>
                  </Cell>
                );
              })}
            </tr>
            <tr>
              <Cell>ARV</Cell>
              {rows.map(({ record, deal }) => (
                <Cell key={record.id}>{money(Number(deal.property.arv) || 0)}</Cell>
              ))}
            </tr>
            <tr>
              <Cell>Purchase Price</Cell>
              {rows.map(({ record, deal }) => (
                <Cell key={record.id}>
                  {money(Number(deal.property.purchasePrice) || 0)}
                </Cell>
              ))}
            </tr>
            <tr>
              <Cell>Repair Cost</Cell>
              {rows.map(({ record, deal }) => (
                <Cell key={record.id}>
                  {money(Number(deal.property.repairCost) || 0)}
                </Cell>
              ))}
            </tr>
            <tr>
              <Cell>Hold Period</Cell>
              {rows.map(({ record, deal }) => (
                <Cell key={record.id}>{deal.property.holdMonths || 0} months</Cell>
              ))}
            </tr>
            <tr>
              <Cell>Total Financing Costs</Cell>
              {rows.map(({ record, summary }) => (
                <Cell key={record.id}>{money(summary.totalFinancing)}</Cell>
              ))}
            </tr>
            <tr>
              <Cell>Total Holding Costs</Cell>
              {rows.map(({ record, summary }) => (
                <Cell key={record.id}>{money(summary.totalHolding)}</Cell>
              ))}
            </tr>
            <tr>
              <Cell>Total Buying Costs</Cell>
              {rows.map(({ record, summary }) => (
                <Cell key={record.id}>{money(summary.totalBuying)}</Cell>
              ))}
            </tr>
            <tr>
              <Cell>Total Selling Costs</Cell>
              {rows.map(({ record, summary }) => (
                <Cell key={record.id}>{money(summary.totalSelling)}</Cell>
              ))}
            </tr>
            <tr className="bg-muted/40">
              <Cell>
                <span className="font-medium">Estimated Net Profit</span>
              </Cell>
              {rows.map(({ record, summary }) => (
                <Cell key={record.id}>
                  <span className="font-medium">{money(summary.netProfit)}</span>
                </Cell>
              ))}
            </tr>
            <tr>
              <Cell>Purchase + Rehab ROI</Cell>
              {rows.map(({ record, summary }) => (
                <Cell key={record.id}>{percent(summary.rehabRoi)}</Cell>
              ))}
            </tr>
            <tr className="bg-muted/40">
              <Cell>
                <span className="font-medium">Estimated ROI (fully loaded)</span>
              </Cell>
              {rows.map(({ record, summary }) => (
                <Cell key={record.id}>
                  <span className="font-medium">{percent(summary.roi)}</span>
                </Cell>
              ))}
            </tr>
            <tr>
              <Cell>Down Payment Required</Cell>
              {rows.map(({ record, summary }) => (
                <Cell key={record.id}>{money(summary.downPayment)}</Cell>
              ))}
            </tr>
            <tr>
              <Cell>My Committed Capital</Cell>
              {rows.map(({ record, summary }) => (
                <Cell key={record.id}>{money(summary.committedCapital)}</Cell>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
