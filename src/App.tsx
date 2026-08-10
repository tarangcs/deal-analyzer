import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { PropertySection } from "@/components/deal-form/property-section";
import { FinancingSection } from "@/components/deal-form/financing-section";
import { HoldingSection } from "@/components/deal-form/holding-section";
import { TransactionCostsSection } from "@/components/deal-form/transaction-costs-section";
import { DealSummarySection } from "@/components/deal-form/deal-summary-section";
import { SettingsDialog } from "@/components/deal-form/settings-dialog";
import { DealsList } from "@/components/deals-list/deals-list";
import { DealDetail } from "@/components/deals-list/deal-detail";
import { DealComparison } from "@/components/deals-list/deal-comparison";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useDraftState } from "@/hooks/use-draft-state";
import { createDeal, toFullDeal, updateDeal, type DealRecord } from "@/lib/backend";
import { numOrZero, purchaseRepairTotal, summarizeDeal } from "@/lib/calculations";
import { DEFAULT_SETTINGS, EMPTY_DEAL, dealFromSettings, type Deal } from "@/lib/types";
import { validatePropertyInfo } from "@/lib/validation";

const DRAFT_KEY = "deal-analyzer:draft:deal";
const SETTINGS_KEY = "deal-analyzer:settings";

/** Scopes setDeal to one section of the Deal, so each section component gets a plain useState-shaped setter. */
function makeSectionSetter<K extends keyof Deal>(
  setDeal: React.Dispatch<React.SetStateAction<Deal>>,
  key: K,
): React.Dispatch<React.SetStateAction<Deal[K]>> {
  return (update) => {
    setDeal((prev) => ({
      ...prev,
      [key]:
        typeof update === "function"
          ? (update as (v: Deal[K]) => Deal[K])(prev[key])
          : update,
    }));
  };
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

type View = "calculator" | "deals" | "dealDetail" | "compare";

function App() {
  const [view, setView] = useState<View>("calculator");
  const [openDealRecord, setOpenDealRecord] = useState<DealRecord | null>(null);
  const [compareRecords, setCompareRecords] = useState<DealRecord[]>([]);
  const [deal, setDeal] = useDraftState(DRAFT_KEY, EMPTY_DEAL);
  const [settings, setSettings] = useDraftState(SETTINGS_KEY, DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  // Set while editing an existing saved deal, so Save updates that row
  // instead of creating a new one. Notes has no editable UI yet (Step
  // 13) but is carried through so editing-and-resaving doesn't wipe it.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  function openDeal(record: DealRecord) {
    setOpenDealRecord(record);
    setView("dealDetail");
  }

  function compareDeals(records: DealRecord[]) {
    setCompareRecords(records);
    setView("compare");
  }

  function startNewDeal() {
    setDeal(dealFromSettings(settings));
    setSaveStatus("idle");
    setEditingId(null);
    setNotes("");
  }

  function editDeal(record: DealRecord) {
    setDeal(toFullDeal(record));
    setEditingId(record.id);
    setNotes(record.notes);
    setSaveStatus("idle");
    setView("calculator");
  }

  async function handleSaveDeal() {
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const summary = summarizeDeal(deal);
      const payload = {
        evaluatorName: deal.property.evaluatorName,
        propertyAddress: deal.property.propertyAddress,
        status: deal.property.status,
        date: deal.property.date,
        arv: numOrZero(deal.property.arv),
        purchasePrice: numOrZero(deal.property.purchasePrice),
        estimatedNetProfit: summary.netProfit,
        estimatedRoiPercent: summary.roi * 100,
        dealQuality: summary.quality,
        notes,
        deal,
      };
      if (editingId) {
        await updateDeal(editingId, payload);
      } else {
        await createDeal(payload);
      }
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Save failed");
    }
  }

  // Editing after a save (or a failed attempt) clears the stale status —
  // "Saved" shouldn't keep showing once the deal has changed since.
  useEffect(() => {
    setSaveStatus("idle");
  }, [deal]);

  const setProperty = makeSectionSetter(setDeal, "property");
  const setFinancing = makeSectionSetter(setDeal, "financing");
  const setHolding = makeSectionSetter(setDeal, "holding");
  const setBuying = makeSectionSetter(setDeal, "buying");
  const setSelling = makeSectionSetter(setDeal, "selling");

  const errors = useMemo(
    () => validatePropertyInfo(deal.property),
    [deal.property],
  );
  const hasErrors = Object.keys(errors).length > 0;

  const total = useMemo(() => {
    if (typeof deal.property.repairCost !== "number") return null;
    if (typeof deal.property.purchasePrice !== "number") return null;
    return purchaseRepairTotal(
      deal.property.repairCost,
      deal.property.purchasePrice,
    );
  }, [deal.property.repairCost, deal.property.purchasePrice]);

  const holdMonths = numOrZero(deal.property.holdMonths);

  return (
    <TooltipProvider>
      <div className="min-h-svh flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-6">
              <span className="text-lg font-semibold tracking-tight">
                Deal Analyzer
              </span>
              <nav className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setView("calculator")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    view === "calculator"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Calculator
                </button>
                <button
                  type="button"
                  onClick={() => setView("deals")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    view !== "calculator"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Deals
                </button>
              </nav>
            </div>
            <SettingsDialog value={settings} onChange={setSettings} />
          </div>
        </header>

        {view === "deals" && (
          <main className="flex-1 px-4 py-8">
            <div className="mx-auto max-w-3xl">
              <DealsList onOpenDeal={openDeal} onCompare={compareDeals} />
            </div>
          </main>
        )}

        {view === "dealDetail" && openDealRecord && (
          <main className="flex-1 px-4 py-8">
            <div className="mx-auto max-w-3xl">
              <DealDetail
                record={openDealRecord}
                onBack={() => setView("deals")}
                onEdit={editDeal}
                onChanged={() => setView("deals")}
              />
            </div>
          </main>
        )}

        {view === "compare" && (
          <main className="flex-1 px-4 py-8">
            <div className="mx-auto max-w-5xl">
              <DealComparison
                records={compareRecords}
                onBack={() => setView("deals")}
              />
            </div>
          </main>
        )}

        {view === "calculator" && (
        <main className="flex-1 px-4 py-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {editingId && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <span>
                  Editing a saved deal — Save updates it in place, it won't
                  create a duplicate.
                </span>
                <Button variant="outline" size="sm" onClick={startNewDeal}>
                  Cancel
                </Button>
              </div>
            )}

            <PropertySection
              value={deal.property}
              onChange={setProperty}
              errors={errors}
            />

            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Purchase + Repair Cost
                </p>
                <p className="text-2xl font-semibold tracking-tight">
                  {total === null
                    ? "—"
                    : total.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
                </p>
              </div>
              <Button variant="outline" onClick={startNewDeal}>
                New Deal
              </Button>
            </div>

            {hasErrors && (
              <p className="text-sm text-muted-foreground">
                Fill in the required fields (marked with *) to continue.
              </p>
            )}

            <FinancingSection
              value={deal.financing}
              onChange={setFinancing}
              holdMonths={holdMonths}
            />

            <HoldingSection
              value={deal.holding}
              onChange={setHolding}
              holdMonths={holdMonths}
            />

            <TransactionCostsSection
              buying={deal.buying}
              onBuyingChange={setBuying}
              selling={deal.selling}
              onSellingChange={setSelling}
              purchasePrice={numOrZero(deal.property.purchasePrice)}
              arv={numOrZero(deal.property.arv)}
            />

            <DealSummarySection
              deal={deal}
              onRoiThresholdChange={(value) =>
                setDeal((prev) => ({ ...prev, roiThresholdPercent: value }))
              }
            />

            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                {saveStatus === "saving" && "Saving…"}
                {saveStatus === "saved" &&
                  (editingId
                    ? "Updated in the shared deals list."
                    : "Saved to the shared deals list.")}
                {saveStatus === "error" &&
                  `Couldn't save: ${saveError ?? "unknown error"}`}
                {saveStatus === "idle" &&
                  (hasErrors
                    ? "Fill in the required fields above to save."
                    : "")}
              </p>
              <Button
                onClick={handleSaveDeal}
                disabled={hasErrors || saveStatus === "saving"}
              >
                {saveStatus === "saving"
                  ? "Saving…"
                  : editingId
                    ? "Update Deal"
                    : "Save Deal"}
              </Button>
            </div>
          </div>
        </main>
        )}
      </div>
    </TooltipProvider>
  );
}

export default App;
