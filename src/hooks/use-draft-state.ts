import { useEffect, useState } from "react";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Fills in any keys missing from a stored draft with their default value,
 * recursing into nested objects. Protects against a blank-screen crash
 * when the app's data shape grows (new section added, new field on an
 * existing section) after a draft was already saved to localStorage —
 * without this, reading e.g. `deal.holding.annualPropertyTaxes` on an
 * old draft saved before the "holding" section existed throws.
 */
export function withDefaults<T>(defaults: T, stored: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(stored)) {
    return stored === undefined ? defaults : (stored as T);
  }
  const result: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(defaults)) {
    result[key] = withDefaults(defaults[key], stored[key]);
  }
  return result as T;
}

/**
 * Like useState, but persists to localStorage on every change and restores
 * on mount. Protects in-progress form entry from a dropped call, tab
 * close, or app switch while evaluating a deal in the field.
 */
export function useDraftState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (!stored) return initialValue;
    try {
      return withDefaults(initialValue, JSON.parse(stored));
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  const clear = () => {
    localStorage.removeItem(key);
    setValue(initialValue);
  };

  return [value, setValue, clear] as const;
}
