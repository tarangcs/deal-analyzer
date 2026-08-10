import { InfoIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FieldLabel({
  htmlFor,
  label,
  definition,
  required,
}: {
  htmlFor?: string;
  label: string;
  definition?: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {definition && (
        <Tooltip>
          <TooltipTrigger
            type="button"
            aria-label={`What is ${label}?`}
            className="text-muted-foreground"
          >
            <InfoIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>{definition}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
