import { withDefaults } from "./deep-merge";
import { EMPTY_DEAL, type Deal } from "./types";

const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

export interface CreateDealPayload {
  evaluatorName: string;
  propertyAddress: string;
  status: string;
  date: string;
  arv: number;
  purchasePrice: number;
  estimatedNetProfit: number;
  estimatedRoiPercent: number;
  dealQuality: string;
  notes: string;
  deal: Deal;
}

/**
 * POSTs with Content-Type: text/plain (not application/json) — Apps
 * Script's CORS handling doesn't support the preflighted request a real
 * JSON content-type would trigger. Apps Script reads the raw body
 * regardless of what the header claims.
 *
 * Apps Script always responds HTTP 200, even when the action itself was
 * rejected (e.g. delete without a reason) — that comes back as
 * `{ ok: false, error }` in the body, not a non-2xx status. Checking for
 * it here means every caller gets a real thrown error instead of having
 * to remember to check `.ok` itself.
 */
async function postAction(
  body: Record<string, unknown>,
): Promise<{ ok: boolean; [key: string]: unknown }> {
  if (!API_URL) {
    throw new Error("VITE_APPS_SCRIPT_URL is not configured");
  }
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Backend request failed: ${res.status}`);
  }
  const result = await res.json();
  if (result && typeof result === "object" && result.ok === false) {
    throw new Error(
      typeof result.error === "string" ? result.error : "Request failed",
    );
  }
  return result;
}

export async function createDeal(
  payload: CreateDealPayload,
): Promise<{ ok: boolean; id: string }> {
  const result = await postAction({ action: "create", ...payload });
  return result as { ok: boolean; id: string };
}

export async function updateDeal(
  id: string,
  payload: CreateDealPayload,
): Promise<{ ok: boolean }> {
  const result = await postAction({ action: "update", id, ...payload });
  return result as { ok: boolean };
}

export async function archiveDeal(
  id: string,
  archived: boolean,
): Promise<{ ok: boolean }> {
  const result = await postAction({ action: "archive", id, archived });
  return result as { ok: boolean };
}

/**
 * `reason` is required — the backend rejects an empty one. Deletes move
 * the row to the "Deleted" sheet rather than erasing it, so the group
 * can review or recover it later (see google-apps-script/Code.gs).
 */
export async function deleteDeal(
  id: string,
  reason: string,
): Promise<{ ok: boolean }> {
  const result = await postAction({ action: "delete", id, reason });
  return result as { ok: boolean };
}

/**
 * A saved deal as returned by the backend's list endpoint. Numeric-ish
 * fields are typed loosely (number | string) because rows added by hand
 * directly in the Sheet (rather than through this app) can have blank
 * cells (empty string) or non-numeric text — see ROADMAP.md Step 10.
 */
export interface DealRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  evaluatorName: string;
  propertyAddress: string;
  status: string;
  date: string;
  arv: number | string;
  purchasePrice: number | string;
  estimatedNetProfit: number | string;
  estimatedRoiPercent: number | string;
  dealQuality: string;
  notes: string;
  archived: boolean;
  deal: Partial<Deal>;
}

export async function listDeals(): Promise<DealRecord[]> {
  if (!API_URL) {
    throw new Error("VITE_APPS_SCRIPT_URL is not configured");
  }
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error(`Backend request failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Reconstructs a full Deal from a DealRecord's (possibly sparse or empty)
 * `deal` JSON, so detail/comparison views can safely call summarizeDeal()
 * and the section components' formatters without every field needing an
 * existence check.
 */
export function toFullDeal(record: DealRecord): Deal {
  return withDefaults(EMPTY_DEAL, record.deal);
}
