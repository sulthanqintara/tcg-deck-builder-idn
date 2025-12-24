import { Input } from "@/components/ui/input";
import { FilterSection } from "./FilterSection";

interface IllustratorFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function IllustratorFilter({ value, onChange }: IllustratorFilterProps) {
  return (
    <FilterSection title="Illustrator">
      <Input
        placeholder="Illustrator name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FilterSection>
  );
}
