function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Fills in any keys missing from `source` with their value from `defaults`,
 * recursing into nested objects. Used for two purposes that both amount to
 * "reconstruct a full shape from a possibly-incomplete object":
 *  - restoring a localStorage draft saved under an older, smaller version
 *    of the Deal shape (see useDraftState) — without this, reading e.g.
 *    `deal.holding.annualPropertyTaxes` on an old draft throws.
 *  - reconstructing a full Deal from a saved DealRecord's `deal` JSON,
 *    which can be sparse or `{}` for rows added by hand directly in the
 *    Sheet (see backend.ts's toFullDeal).
 */
export function withDefaults<T>(defaults: T, source: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(source)) {
    return source === undefined ? defaults : (source as T);
  }
  const result: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(defaults)) {
    result[key] = withDefaults(defaults[key], source[key]);
  }
  return result as T;
}
