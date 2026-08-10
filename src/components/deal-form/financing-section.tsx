import type React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { numOrZero, totalFinancingCosts } from "@/lib/calculations";
import { FIELD_DEFINITIONS, LOAN_DEFINITIONS } from "@/lib/definitions";
import type { FinancingCosts } from "@/lib/types";
import { MortgageLoanFields } from "./mortgage-loan-fields";
import { NumberField } from "./number-field";

export function FinancingSection({
  value,
  onChange,
  holdMonths,
}: {
  value: FinancingCosts;
  onChange: React.Dispatch<React.SetStateAction<FinancingCosts>>;
  holdMonths: number;
}) {
  const total = totalFinancingCosts(
    [value.firstMortgage, value.secondMortgage, value.miscMortgage],
    numOrZero(value.miscFinancingCosts),
    holdMonths,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financing Costs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MortgageLoanFields
          idPrefix="firstMortgage"
          title="First Mortgage"
          value={value.firstMortgage}
          onChange={(loan) => onChange((prev) => ({ ...prev, firstMortgage: loan }))}
          holdMonths={holdMonths}
          definitions={LOAN_DEFINITIONS.firstMortgage}
        />
        <MortgageLoanFields
          idPrefix="secondMortgage"
          title="Second Mortgage"
          value={value.secondMortgage}
          onChange={(loan) => onChange((prev) => ({ ...prev, secondMortgage: loan }))}
          holdMonths={holdMonths}
          definitions={LOAN_DEFINITIONS.secondMortgage}
        />
        <MortgageLoanFields
          idPrefix="miscMortgage"
          title="Misc. Mortgage"
          value={value.miscMortgage}
          onChange={(loan) => onChange((prev) => ({ ...prev, miscMortgage: loan }))}
          holdMonths={holdMonths}
          definitions={LOAN_DEFINITIONS.miscMortgage}
        />

        <div className="max-w-xs">
          <NumberField
            id="miscFinancingCosts"
            label="Miscellaneous Financing Costs"
            definition={FIELD_DEFINITIONS.miscFinancingCosts}
            value={value.miscFinancingCosts}
            onChange={(v) =>
              onChange((prev) => ({ ...prev, miscFinancingCosts: v }))
            }
            prefix="$"
          />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">
            Total Financing Costs
          </span>
          <span className="text-lg font-semibold tracking-tight">
            {total.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
