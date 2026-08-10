import type React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldLabel } from "./field-label";
import { NumberField } from "./number-field";
import { FIELD_DEFINITIONS } from "@/lib/definitions";
import { DEAL_STATUSES, type PropertyInfo } from "@/lib/types";

export function PropertySection({
  value,
  onChange,
  errors,
}: {
  value: PropertyInfo;
  onChange: React.Dispatch<React.SetStateAction<PropertyInfo>>;
  errors: Partial<Record<keyof PropertyInfo, string>>;
}) {
  function set<K extends keyof PropertyInfo>(key: K, fieldValue: PropertyInfo[K]) {
    onChange((prev) => ({ ...prev, [key]: fieldValue }));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deal Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel
              htmlFor="evaluatorName"
              label="Evaluator Name"
              definition={FIELD_DEFINITIONS.evaluatorName}
              required
            />
            <Input
              id="evaluatorName"
              aria-invalid={!!errors.evaluatorName}
              value={value.evaluatorName}
              onChange={(e) => set("evaluatorName", e.target.value)}
            />
            {errors.evaluatorName && (
              <p className="text-xs text-destructive">{errors.evaluatorName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <FieldLabel htmlFor="date" label="Date" />
            <Input
              id="date"
              type="date"
              value={value.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <FieldLabel
              htmlFor="propertyAddress"
              label="Property Address"
              definition={FIELD_DEFINITIONS.propertyAddress}
              required
            />
            <Input
              id="propertyAddress"
              placeholder="123 Main St, Cleveland, OH 44113"
              aria-invalid={!!errors.propertyAddress}
              value={value.propertyAddress}
              onChange={(e) => set("propertyAddress", e.target.value)}
            />
            {errors.propertyAddress && (
              <p className="text-xs text-destructive">
                {errors.propertyAddress}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <FieldLabel htmlFor="status" label="Status" />
            <Select
              value={value.status}
              onValueChange={(v) => set("status", v as PropertyInfo["status"])}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEAL_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <FieldLabel htmlFor="occupied" label="Occupied?" />
            <Select
              value={value.occupied ? "yes" : "no"}
              onValueChange={(v) => set("occupied", v === "yes")}
            >
              <SelectTrigger id="occupied" className="w-full">
                <SelectValue>{(v: string) => (v === "yes" ? "Yes" : "No")}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <NumberField
            id="squareFootage"
            label="Total Square Footage"
            definition={FIELD_DEFINITIONS.squareFootage}
            required
            error={errors.squareFootage}
            value={value.squareFootage}
            onChange={(v) => set("squareFootage", v)}
            suffix="sq ft"
          />

          <NumberField
            id="units"
            label="# of Units"
            error={errors.units}
            value={value.units}
            onChange={(v) => set("units", v)}
          />

          <div className="space-y-1.5 sm:col-span-2">
            <FieldLabel
              htmlFor="description"
              label="Property Description"
              definition={FIELD_DEFINITIONS.description}
            />
            <Textarea
              id="description"
              rows={3}
              placeholder="3 bedroom 1 bath colonial single family on the north side of Main St."
              value={value.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Property Values / Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            id="arv"
            label="After Repair Value"
            definition={FIELD_DEFINITIONS.arv}
            required
            error={errors.arv}
            value={value.arv}
            onChange={(v) => set("arv", v)}
            prefix="$"
          />

          <NumberField
            id="asIsValue"
            label='Current "As Is" Value'
            definition={FIELD_DEFINITIONS.asIsValue}
            error={errors.asIsValue}
            value={value.asIsValue}
            onChange={(v) => set("asIsValue", v)}
            prefix="$"
          />

          <NumberField
            id="repairCost"
            label="Estimated Repair Costs"
            definition={FIELD_DEFINITIONS.repairCost}
            required
            error={errors.repairCost}
            value={value.repairCost}
            onChange={(v) => set("repairCost", v)}
            prefix="$"
          />

          <NumberField
            id="purchasePrice"
            label="Purchase Price"
            definition={FIELD_DEFINITIONS.purchasePrice}
            required
            error={errors.purchasePrice}
            value={value.purchasePrice}
            onChange={(v) => set("purchasePrice", v)}
            prefix="$"
          />

          <NumberField
            id="holdMonths"
            label="Estimated Hold Time"
            definition={FIELD_DEFINITIONS.holdMonths}
            required
            error={errors.holdMonths}
            value={value.holdMonths}
            onChange={(v) => set("holdMonths", v)}
            suffix="months"
          />
        </CardContent>
      </Card>
    </div>
  );
}
