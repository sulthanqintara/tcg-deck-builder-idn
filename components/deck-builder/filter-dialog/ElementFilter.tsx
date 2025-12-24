import { ElementChip, type EnergyType } from "@/components/ui/element-chip";
import { FilterSection } from "./FilterSection";
import { ENERGY_TYPES } from "@/lib/constants";

interface ElementFilterProps {
  selected: string[];
  onToggle: (type: string) => void;
}

export function ElementFilter({ selected, onToggle }: ElementFilterProps) {
  return (
    <FilterSection title="Element">
      <div className="flex flex-wrap gap-2">
        {ENERGY_TYPES.map((type) => (
          <ElementChip
            key={type}
            energyType={type as EnergyType}
            selected={selected.includes(type)}
            onClick={() => onToggle(type)}
          />
        ))}
      </div>
    </FilterSection>
  );
}
