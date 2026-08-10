import type React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { totalBuyingCosts, totalSellingCosts } from "@/lib/calculations";
import { FIELD_DEFINITIONS } from "@/lib/definitions";
import type { BuyingCosts, SellingCosts } from "@/lib/types";
import { NumberField } from "./number-field";

function TotalRow({ label, total }: { label: string; total: number }) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tracking-tight">
        {total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
      </span>
    </div>
  );
}

export function TransactionCostsSection({
  buying,
  onBuyingChange,
  selling,
  onSellingChange,
  purchasePrice,
  arv,
}: {
  buying: BuyingCosts;
  onBuyingChange: React.Dispatch<React.SetStateAction<BuyingCosts>>;
  selling: SellingCosts;
  onSellingChange: React.Dispatch<React.SetStateAction<SellingCosts>>;
  purchasePrice: number;
  arv: number;
}) {
  function setBuying<K extends keyof BuyingCosts>(key: K, value: BuyingCosts[K]) {
    onBuyingChange((prev) => ({ ...prev, [key]: value }));
  }

  function setSelling<K extends keyof SellingCosts>(key: K, value: SellingCosts[K]) {
    onSellingChange((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Buying Transaction Costs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              id="buyingEscrowAttorneyFees"
              label="Escrow / Attorney Fees"
              definition={FIELD_DEFINITIONS.escrowAttorneyFeesBuying}
              value={buying.escrowAttorneyFees}
              onChange={(v) => setBuying("escrowAttorneyFees", v)}
              prefix="$"
            />
            <NumberField
              id="titleInsurancePercent"
              label="Title Insurance / Search (+ $500 base)"
              definition={FIELD_DEFINITIONS.titleInsurancePercent}
              value={buying.titleInsurancePercent}
              onChange={(v) => setBuying("titleInsurancePercent", v)}
              suffix="% of price"
            />
            <NumberField
              id="miscBuyingCosts"
              label="Miscellaneous Buying Costs"
              definition={FIELD_DEFINITIONS.miscBuyingCosts}
              value={buying.miscBuyingCosts}
              onChange={(v) => setBuying("miscBuyingCosts", v)}
              prefix="$"
            />
          </div>
          <TotalRow
            label="Total Buying Transaction Costs"
            total={totalBuyingCosts(buying, purchasePrice)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selling Transaction Costs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              id="sellingEscrowAttorneyFees"
              label="Escrow / Attorney Fees"
              definition={FIELD_DEFINITIONS.escrowAttorneyFeesSelling}
              value={selling.escrowAttorneyFees}
              onChange={(v) => setSelling("escrowAttorneyFees", v)}
              prefix="$"
            />
            <NumberField
              id="recordingFees"
              label="Selling Recording Fees"
              definition={FIELD_DEFINITIONS.recordingFees}
              value={selling.recordingFees}
              onChange={(v) => setSelling("recordingFees", v)}
              prefix="$"
            />
            <NumberField
              id="realtorFeesPercent"
              label="Realtor Fees"
              definition={FIELD_DEFINITIONS.realtorFeesPercent}
              value={selling.realtorFeesPercent}
              onChange={(v) => setSelling("realtorFeesPercent", v)}
              suffix="% of ARV"
            />
            <NumberField
              id="transferConveyancePercent"
              label="Transfer & Conveyance Fees"
              definition={FIELD_DEFINITIONS.transferConveyancePercent}
              value={selling.transferConveyancePercent}
              onChange={(v) => setSelling("transferConveyancePercent", v)}
              suffix="% of ARV"
            />
            <NumberField
              id="homeWarranty"
              label="Home Warranty"
              definition={FIELD_DEFINITIONS.homeWarranty}
              value={selling.homeWarranty}
              onChange={(v) => setSelling("homeWarranty", v)}
              prefix="$"
            />
            <NumberField
              id="stagingCosts"
              label="Staging Costs"
              definition={FIELD_DEFINITIONS.stagingCosts}
              value={selling.stagingCosts}
              onChange={(v) => setSelling("stagingCosts", v)}
              prefix="$"
            />
            <NumberField
              id="marketingCosts"
              label="Marketing Costs"
              definition={FIELD_DEFINITIONS.marketingCosts}
              value={selling.marketingCosts}
              onChange={(v) => setSelling("marketingCosts", v)}
              prefix="$"
            />
            <NumberField
              id="miscSellingCosts"
              label="Miscellaneous Selling Costs"
              definition={FIELD_DEFINITIONS.miscSellingCosts}
              value={selling.miscSellingCosts}
              onChange={(v) => setSelling("miscSellingCosts", v)}
              prefix="$"
            />
          </div>
          <TotalRow
            label="Total Selling Transaction Costs"
            total={totalSellingCosts(selling, arv)}
          />
        </CardContent>
      </Card>
    </>
  );
}
