import { loanInterestCost, loanPointsCost, numOrZero } from "@/lib/calculations";
import type { MortgageLoan } from "@/lib/types";
import { NumberField } from "./number-field";

export function MortgageLoanFields({
  idPrefix,
  title,
  value,
  onChange,
  holdMonths,
  definitions,
}: {
  idPrefix: string;
  title: string;
  value: MortgageLoan;
  onChange: (next: MortgageLoan) => void;
  holdMonths: number;
  definitions: { amount: string; points: string; interestRate: string };
}) {
  const amount = numOrZero(value.amount);
  const points = numOrZero(value.points);
  const rate = numOrZero(value.interestRate);
  const pointsCost = loanPointsCost(amount, points);
  const interestCost = loanInterestCost(amount, rate, holdMonths);

  function set<K extends keyof MortgageLoan>(key: K, fieldValue: MortgageLoan[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField
          id={`${idPrefix}-amount`}
          label="Lien Amount"
          definition={definitions.amount}
          value={value.amount}
          onChange={(v) => set("amount", v)}
          prefix="$"
        />
        <NumberField
          id={`${idPrefix}-points`}
          label="Points"
          definition={definitions.points}
          value={value.points}
          onChange={(v) => set("points", v)}
          suffix="pts"
        />
        <NumberField
          id={`${idPrefix}-rate`}
          label="Interest Rate"
          definition={definitions.interestRate}
          value={value.interestRate}
          onChange={(v) => set("interestRate", v)}
          suffix="%"
        />
      </div>
      {(amount > 0 || points > 0 || rate > 0) && (
        <p className="text-xs text-muted-foreground">
          Points cost{" "}
          {pointsCost.toLocaleString("en-US", { style: "currency", currency: "USD" })}
          {" · "}
          Interest cost{" "}
          {interestCost.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </p>
      )}
    </div>
  );
}
