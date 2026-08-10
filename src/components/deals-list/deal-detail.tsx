import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { computeSensitivity, summarizeDeal } from "@/lib/calculations";
import {
  archiveDeal,
  deleteDeal,
  toFullDeal,
  type DealRecord,
} from "@/lib/backend";
import { QUALITY_STYLES } from "@/lib/deal-quality-styles";
import { money, moneyDelta, percent } from "@/lib/format";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SensitivityRow({
  label,
  netProfit,
  baseNetProfit,
}: {
  label: string;
  netProfit: number;
  baseNetProfit: number;
}) {
  const delta = netProfit - baseNetProfit;
  const deltaClass =
    delta > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : delta < 0
        ? "text-rose-600 dark:text-rose-400"
        : "text-muted-foreground";
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span>
        <span className="font-medium">{money(netProfit)}</span>{" "}
        <span className={`text-xs ${deltaClass}`}>({moneyDelta(delta)})</span>
      </span>
    </div>
  );
}

type ActionStatus = "idle" | "archiving" | "deleting" | "error";

export function DealDetail({
  record,
  onBack,
  onEdit,
  onChanged,
}: {
  record: DealRecord;
  onBack: () => void;
  onEdit: (record: DealRecord) => void;
  /** Called after a successful archive/delete, so the caller can return to a fresh list. */
  onChanged: () => void;
}) {
  const [status, setStatus] = useState<ActionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deal = toFullDeal(record);
  const summary = summarizeDeal(deal);
  const sensitivity = computeSensitivity(deal);
  const qualityStyle = QUALITY_STYLES[summary.quality];
  const loans = [
    { label: "First Mortgage", loan: deal.financing.firstMortgage },
    { label: "Second Mortgage", loan: deal.financing.secondMortgage },
    { label: "Misc. Mortgage", loan: deal.financing.miscMortgage },
  ].filter(({ loan }) => loan.amount !== "" && loan.amount !== 0);

  const busy = status === "archiving" || status === "deleting";

  async function handleArchive() {
    setStatus("archiving");
    setError(null);
    try {
      await archiveDeal(record.id, true);
      onChanged();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Couldn't archive this deal");
    }
  }

  async function handleDelete() {
    setStatus("deleting");
    setError(null);
    try {
      await deleteDeal(record.id, deleteReason.trim());
      setDeleteDialogOpen(false);
      onChanged();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Couldn't delete this deal");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" onClick={onBack}>
          ← Back to Deals
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit(record)} disabled={busy}>
            Edit
          </Button>
          <Button variant="outline" onClick={handleArchive} disabled={busy}>
            {status === "archiving" && (
              <Loader2Icon className="size-4 animate-spin" />
            )}
            Archive
          </Button>
          <Dialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) setDeleteReason("");
            }}
          >
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                />
              }
            >
              Delete
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Delete "{record.propertyAddress || "this deal"}"?
                </DialogTitle>
                <DialogDescription>
                  This moves it to the Deleted sheet rather than erasing it —
                  the group can review or recover it there. A reason is
                  required.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5">
                <Label htmlFor="deleteReason">Reason for deleting</Label>
                <Textarea
                  id="deleteReason"
                  rows={2}
                  placeholder="e.g. duplicate entry, entered by mistake, seller backed out"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                />
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={!deleteReason.trim() || busy}
                >
                  {status === "deleting" && (
                    <Loader2Icon className="size-4 animate-spin" />
                  )}
                  {status === "deleting" ? "Deleting…" : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

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

          <div>
            <h3 className="mb-1 text-sm font-medium">
              Sensitivity Check{" "}
              <span className="font-normal text-muted-foreground">
                (±10% on the least certain inputs)
              </span>
            </h3>
            {sensitivity.map((s) => (
              <SensitivityRow
                key={s.label}
                label={s.label}
                netProfit={s.netProfit}
                baseNetProfit={summary.netProfit}
              />
            ))}
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
