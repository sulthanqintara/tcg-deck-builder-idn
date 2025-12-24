import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FilterSection } from "./FilterSection";
import type { CardCategory } from "@/lib/types";
import { CARD_CATEGORIES } from "@/lib/constants";

const CATEGORY_OPTIONS: { value: CardCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: CARD_CATEGORIES.POKEMON, label: "Pokémon" },
  { value: CARD_CATEGORIES.TRAINER, label: "Trainer" },
  { value: CARD_CATEGORIES.ENERGY, label: "Energy" },
];

interface CardTypeFilterProps {
  value: CardCategory;
  onChange: (value: CardCategory) => void;
}

export function CardTypeFilter({ value, onChange }: CardTypeFilterProps) {
  return (
    <FilterSection title="Card Type">
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as CardCategory)}
        className="grid grid-cols-2 gap-2"
      >
        {CATEGORY_OPTIONS.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors"
          >
            <RadioGroupItem
              value={option.value}
              id={`dialog-cat-${option.value}`}
            />
            <Label
              htmlFor={`dialog-cat-${option.value}`}
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
