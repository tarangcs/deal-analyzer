import { useMemo } from "react";
import type React from "react";
import { PropertySection } from "@/components/deal-form/property-section";
import { FinancingSection } from "@/components/deal-form/financing-section";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useDraftState } from "@/hooks/use-draft-state";
import { numOrZero, purchaseRepairTotal } from "@/lib/calculations";
import { EMPTY_DEAL, type FinancingCosts, type PropertyInfo } from "@/lib/types";
import { validatePropertyInfo } from "@/lib/validation";

const DRAFT_KEY = "deal-analyzer:draft:deal";

function App() {
  const [deal, setDeal, clearDraft] = useDraftState(DRAFT_KEY, EMPTY_DEAL);

  const setProperty: React.Dispatch<React.SetStateAction<PropertyInfo>> = (update) => {
    setDeal((prev) => ({
      ...prev,
      property:
        typeof update === "function"
          ? (update as (p: PropertyInfo) => PropertyInfo)(prev.property)
          : update,
    }));
  };

  const setFinancing: React.Dispatch<React.SetStateAction<FinancingCosts>> = (
    update,
  ) => {
    setDeal((prev) => ({
      ...prev,
      financing:
        typeof update === "function"
          ? (update as (f: FinancingCosts) => FinancingCosts)(prev.financing)
          : update,
    }));
  };

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
              holdMonths={numOrZero(deal.property.holdMonths)}
            />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

export default App;
