import { Input } from "@/components/ui/input";
import { FieldLabel } from "./field-label";

export function NumberField({
  id,
  label,
  definition,
  required,
  error,
  value,
  onChange,
  prefix,
  suffix,
}: {
  id: string;
  label: string;
  definition?: string;
  required?: boolean;
  error?: string;
  value: number | "";
  onChange: (value: number | "") => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel
        htmlFor={id}
        label={label}
        definition={definition}
        required={required}
      />
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          aria-invalid={!!error}
          className={prefix ? "pl-6" : suffix ? "pr-14" : undefined}
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange("");
              return;
            }
            const parsed = Number(raw);
            if (!Number.isNaN(parsed)) onChange(parsed);
          }}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
