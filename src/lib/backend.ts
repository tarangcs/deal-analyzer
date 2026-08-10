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
 */
async function postAction(body: Record<string, unknown>): Promise<unknown> {
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
  return res.json();
}

export async function createDeal(
  payload: CreateDealPayload,
): Promise<{ ok: boolean; id: string }> {
  const result = await postAction({ action: "create", ...payload });
  return result as { ok: boolean; id: string };
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
