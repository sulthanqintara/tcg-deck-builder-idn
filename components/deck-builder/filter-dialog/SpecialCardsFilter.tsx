import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterSection } from "./FilterSection";
import { SPECIAL_CARD_OPTIONS } from "@/lib/constants";

interface SpecialCardsFilterProps {
  selected: string[];
  onToggle: (value: string) => void;
}

export function SpecialCardsFilter({
  selected,
  onToggle,
}: SpecialCardsFilterProps) {
  return (
    <FilterSection title="Special Cards">
      <div className="space-y-2">
        {SPECIAL_CARD_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`dialog-special-${option.value}`}
              checked={selected.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
            />
            <Label
              htmlFor={`dialog-special-${option.value}`}
              className="text-sm cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </FilterSection>
  );
}
