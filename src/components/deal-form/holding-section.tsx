import type React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { numOrZero, totalHoldingCosts, totalMonthlyHoldingCosts } from "@/lib/calculations";
import { FIELD_DEFINITIONS } from "@/lib/definitions";
import type { HoldingCosts } from "@/lib/types";
import { FieldLabel } from "./field-label";
import { NumberField } from "./number-field";

export function HoldingSection({
  value,
  onChange,
  holdMonths,
}: {
  value: HoldingCosts;
  onChange: React.Dispatch<React.SetStateAction<HoldingCosts>>;
  holdMonths: number;
}) {
  function set<K extends keyof HoldingCosts>(key: K, fieldValue: HoldingCosts[K]) {
    onChange((prev) => ({ ...prev, [key]: fieldValue }));
  }

  const monthlyTotal = totalMonthlyHoldingCosts(value);
  const total = totalHoldingCosts(monthlyTotal, holdMonths);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holding Costs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            id="annualPropertyTaxes"
            label="Property Taxes (Annual)"
            definition={FIELD_DEFINITIONS.annualPropertyTaxes}
            value={value.annualPropertyTaxes}
            onChange={(v) => set("annualPropertyTaxes", v)}
            prefix="$"
          />
          <NumberField
            id="monthlyHoaFees"
            label="HOA / Condo Fees (Monthly)"
            definition={FIELD_DEFINITIONS.monthlyHoaFees}
            value={value.monthlyHoaFees}
            onChange={(v) => set("monthlyHoaFees", v)}
            prefix="$"
          />
          <NumberField
            id="annualInsurance"
            label="Insurance Costs (Annual)"
            definition={FIELD_DEFINITIONS.annualInsurance}
            value={value.annualInsurance}
            onChange={(v) => set("annualInsurance", v)}
            prefix="$"
          />
          <NumberField
            id="miscHoldingCosts"
            label="Miscellaneous Holding Costs (Monthly)"
            definition={FIELD_DEFINITIONS.miscHoldingCosts}
            value={value.miscHoldingCosts}
            onChange={(v) => set("miscHoldingCosts", v)}
            prefix="$"
          />
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <FieldLabel
            label="Utilities (Monthly)"
            definition={FIELD_DEFINITIONS.monthlyUtilities}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <NumberField
              id="monthlyGas"
              label="Gas"
              value={value.monthlyGas}
              onChange={(v) => set("monthlyGas", v)}
              prefix="$"
            />
            <NumberField
              id="monthlyWater"
              label="Water"
              value={value.monthlyWater}
              onChange={(v) => set("monthlyWater", v)}
              prefix="$"
            />
            <NumberField
              id="monthlyElectricity"
              label="Electricity"
              value={value.monthlyElectricity}
              onChange={(v) => set("monthlyElectricity", v)}
              prefix="$"
            />
            <NumberField
              id="monthlyMiscUtilities"
              label="Misc."
              value={value.monthlyMiscUtilities}
              onChange={(v) => set("monthlyMiscUtilities", v)}
              prefix="$"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Total Monthly Holding Costs
            </p>
            <p className="text-xs text-muted-foreground">
              {monthlyTotal.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
              {" x "}
              {numOrZero(holdMonths)} month{holdMonths === 1 ? "" : "s"} held
            </p>
          </div>
          <span className="text-lg font-semibold tracking-tight">
            {total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
