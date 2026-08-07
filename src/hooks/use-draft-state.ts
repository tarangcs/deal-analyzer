import { useEffect, useState } from "react";

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
      return JSON.parse(stored) as T;
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
