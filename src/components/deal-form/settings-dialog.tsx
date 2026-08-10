import type React from "react";
import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Settings } from "@/lib/types";
import { NumberField } from "./number-field";

export function SettingsDialog({
  value,
  onChange,
}: {
  value: Settings;
  onChange: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  function set<K extends keyof Settings>(key: K, fieldValue: Settings[K]) {
    onChange((prev) => ({ ...prev, [key]: fieldValue }));
  }

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline" size="icon" aria-label="Settings" />}
      >
        <SettingsIcon className="size-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Defaults</DialogTitle>
          <DialogDescription>
            Applied to every new deal — won't change a deal already in
            progress.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            id="defaultHoldMonths"
            label="Default Hold Period"
            value={value.defaultHoldMonths}
            onChange={(v) => set("defaultHoldMonths", v)}
            suffix="months"
          />
          <NumberField
            id="defaultRoiThresholdPercent"
            label="Default ROI Threshold"
            value={value.defaultRoiThresholdPercent}
            onChange={(v) => set("defaultRoiThresholdPercent", v)}
            suffix="%"
          />
          <NumberField
            id="defaultTitleInsurancePercent"
            label="Title Insurance"
            value={value.defaultTitleInsurancePercent}
            onChange={(v) => set("defaultTitleInsurancePercent", v)}
            suffix="% of price"
          />
          <NumberField
            id="defaultRealtorFeesPercent"
            label="Realtor Fees"
            value={value.defaultRealtorFeesPercent}
            onChange={(v) => set("defaultRealtorFeesPercent", v)}
            suffix="% of ARV"
          />
          <NumberField
            id="defaultTransferConveyancePercent"
            label="Transfer & Conveyance Fees"
            value={value.defaultTransferConveyancePercent}
            onChange={(v) => set("defaultTransferConveyancePercent", v)}
            suffix="% of ARV"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
