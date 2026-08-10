import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { isPartialNumericInput } from "@/lib/number-input";
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
  const [text, setText] = useState(() => (value === "" ? "" : String(value)));
  // Tracks the value we last committed via onChange, so we can tell "the
  // parent's value prop changed because of our own edit" (don't resync,
  // that would clobber an in-progress "0.") apart from "it changed for
  // some other reason" (e.g. a Clear Draft reset — do resync).
  const lastCommitted = useRef(value);

  if (value !== lastCommitted.current) {
    lastCommitted.current = value;
    setText(value === "" ? "" : String(value));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setText(raw);

    if (raw === "") {
      lastCommitted.current = "";
      onChange("");
      return;
    }
    if (isPartialNumericInput(raw)) return;

    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      lastCommitted.current = parsed;
      onChange(parsed);
    }
  }

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
          value={text}
          onChange={handleChange}
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
