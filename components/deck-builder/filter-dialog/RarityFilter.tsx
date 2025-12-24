import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterSection } from "./FilterSection";
import { RARITY_OPTIONS } from "@/lib/constants";

interface RarityFilterProps {
  selected: string[];
  onToggle: (rarity: string) => void;
}

export function RarityFilter({ selected, onToggle }: RarityFilterProps) {
  return (
    <FilterSection title="Rarity">
      <div className="grid grid-cols-4 gap-2">
        {RARITY_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center space-x-1.5">
            <Checkbox
              id={`dialog-rarity-${option.value}`}
              checked={selected.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
              className="h-3.5 w-3.5"
            />
            <Label
              htmlFor={`dialog-rarity-${option.value}`}
              className="text-xs cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </FilterSection>
  );
}
