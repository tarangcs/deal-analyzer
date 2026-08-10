import { useMemo } from "react";
import type React from "react";
import { PropertySection } from "@/components/deal-form/property-section";
import { FinancingSection } from "@/components/deal-form/financing-section";
import { HoldingSection } from "@/components/deal-form/holding-section";
import { TransactionCostsSection } from "@/components/deal-form/transaction-costs-section";
import { DealSummarySection } from "@/components/deal-form/deal-summary-section";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useDraftState } from "@/hooks/use-draft-state";
import { numOrZero, purchaseRepairTotal } from "@/lib/calculations";
import { EMPTY_DEAL, type Deal } from "@/lib/types";
import { validatePropertyInfo } from "@/lib/validation";

const DRAFT_KEY = "deal-analyzer:draft:deal";

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

function App() {
  const [deal, setDeal, clearDraft] = useDraftState(DRAFT_KEY, EMPTY_DEAL);

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
          <div className="mx-auto max-w-3xl px-4 py-4">
            <span className="text-lg font-semibold tracking-tight">
              Deal Analyzer
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-8">
          <div className="mx-auto max-w-3xl space-y-6">
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
              <Button variant="outline" onClick={clearDraft}>
                Clear draft
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
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

export default App;
