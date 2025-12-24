import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FilterSection } from "./FilterSection";
import type { RegulationType } from "@/lib/types";

const REGULATION_OPTIONS: { value: RegulationType; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "expanded", label: "Expanded" },
  { value: "other", label: "Other" },
  { value: "all", label: "All" },
];

interface RegulationFilterProps {
  value: RegulationType;
  onChange: (value: RegulationType) => void;
}

export function RegulationFilter({ value, onChange }: RegulationFilterProps) {
  return (
    <FilterSection title="Regulation">
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as RegulationType)}
        className="grid grid-cols-2 gap-2"
      >
        {REGULATION_OPTIONS.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors"
          >
            <RadioGroupItem
              value={option.value}
              id={`dialog-reg-${option.value}`}
            />
            <Label
              htmlFor={`dialog-reg-${option.value}`}
              className="text-sm cursor-pointer flex-1"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FilterSection>
  );
}
