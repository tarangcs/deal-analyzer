import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listDeals, type DealRecord } from "@/lib/backend";
import type { DealQuality } from "@/lib/calculations";
import { toNumberLoose } from "@/lib/calculations";
import { QUALITY_STYLES } from "@/lib/deal-quality-styles";
import { money } from "@/lib/format";
import { DEAL_STATUSES } from "@/lib/types";

type SortOption = "date" | "roi";

function isDealQuality(value: string): value is DealQuality {
  return value === "good" || value === "marginal" || value === "poor";
}

function qualityStyleFor(value: string) {
  if (isDealQuality(value)) return QUALITY_STYLES[value];
  return {
    label: value || "Unknown",
    className: "bg-muted text-muted-foreground border-border",
  };
}

function formatDate(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

const MAX_COMPARE = 3;

export function DealsList({
  onOpenDeal,
  onCompare,
}: {
  onOpenDeal: (record: DealRecord) => void;
  onCompare: (records: DealRecord[]) => void;
}) {
  const [deals, setDeals] = useState<DealRecord[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_COMPARE) {
        next.add(id);
      }
      return next;
    });
  }

  async function load() {
    setLoadError(null);
    setDeals(null);
    try {
      setDeals(await listDeals());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load deals");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible = (deals ?? [])
    .filter((d) => !d.archived)
    .filter((d) => statusFilter === "All" || d.status === statusFilter)
    .filter((d) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        d.propertyAddress.toLowerCase().includes(q) ||
        d.evaluatorName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "roi") {
        return toNumberLoose(b.estimatedRoiPercent) - toNumberLoose(a.estimatedRoiPercent);
      }
      const aTime = new Date(a.date || a.createdAt).getTime();
      const bTime = new Date(b.date || b.createdAt).getTime();
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by address or evaluator…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "All")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue>{(v: string) => (v === "All" ? "All statuses" : v)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {DEAL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v === "roi" ? "roi" : "date")}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue>
              {(v: string) => (v === "roi" ? "Highest ROI first" : "Newest first")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Newest first</SelectItem>
            <SelectItem value="roi">Highest ROI first</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={load}>
          Refresh
        </Button>
      </div>

      {deals === null && !loadError && (
        <p className="text-sm text-muted-foreground">Loading deals…</p>
      )}
      {loadError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn't load deals: {loadError}
        </div>
      )}
      {deals !== null && !loadError && visible.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {deals.length === 0
            ? "No deals saved yet."
            : "No deals match your search."}
        </p>
      )}

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm text-muted-foreground">
            {selectedIds.size} selected for comparison
            {selectedIds.size < 2 ? " (pick at least 2)" : ""}
            {selectedIds.size >= MAX_COMPARE ? ` (max ${MAX_COMPARE})` : ""}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
            <Button
              size="sm"
              disabled={selectedIds.size < 2}
              onClick={() =>
                onCompare((deals ?? []).filter((d) => selectedIds.has(d.id)))
              }
            >
              Compare
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {visible.map((d) => {
          const quality = qualityStyleFor(d.dealQuality);
          const checked = selectedIds.has(d.id);
          return (
            <div
              key={d.id}
              onClick={() => onOpenDeal(d)}
              className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && selectedIds.size >= MAX_COMPARE}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelected(d.id)}
                    aria-label={`Select ${d.propertyAddress || "deal"} for comparison`}
                    className="mt-1 size-4 accent-foreground"
                  />
                  <div>
                    <p className="font-medium">{d.propertyAddress || "(no address)"}</p>
                    <p className="text-sm text-muted-foreground">
                      {d.evaluatorName || "—"} · {d.status || "—"} · {formatDate(d.date)}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${quality.className}`}
                >
                  {quality.label}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span>ARV: {money(toNumberLoose(d.arv))}</span>
                <span>Purchase: {money(toNumberLoose(d.purchasePrice))}</span>
                <span>Net Profit: {money(toNumberLoose(d.estimatedNetProfit))}</span>
                <span>
                  ROI:{" "}
                  {toNumberLoose(d.estimatedRoiPercent).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                  %
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
