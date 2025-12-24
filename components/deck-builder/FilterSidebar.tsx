"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type CardFilters,
  type CardCategory,
  type RegulationType,
} from "@/lib/types";
import {
  RARITY_OPTIONS,
  SPECIAL_CARD_OPTIONS,
  CARD_CATEGORIES,
} from "@/lib/constants";
import { useSets } from "@/hooks/use-cards";

interface FilterSidebarProps {
  filters: CardFilters;
  onFiltersChange: (filters: CardFilters) => void;
}

export function FilterSidebar({
  filters,
  onFiltersChange,
}: FilterSidebarProps) {
  const { data: sets = [], isLoading: setsLoading } = useSets();

  const updateFilter = <K extends keyof CardFilters>(
    key: K,
    value: CardFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleRarity = (rarity: string) => {
    const newRarities = filters.rarities.includes(rarity)
      ? filters.rarities.filter((r) => r !== rarity)
      : [...filters.rarities, rarity];
    updateFilter("rarities", newRarities);
  };

  const toggleSpecialCard = (value: string) => {
    const newSpecial = filters.specialCards.includes(value)
      ? filters.specialCards.filter((s) => s !== value)
      : [...filters.specialCards, value];
    updateFilter("specialCards", newSpecial);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Search */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-center border-b pb-2">
            Cari Kartu
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Persempit dengan kata kunci"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-9"
            />
          </div>
        </section>

        {/* Card Type */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-center border-b pb-2">
            Jenis kartu
          </h3>
          <RadioGroup
            value={filters.category}
            onValueChange={(v) => updateFilter("category", v as CardCategory)}
            className="space-y-2"
          >
            {[
              { value: "all", label: "Semua" },
              { value: CARD_CATEGORIES.POKEMON, label: "Pokémon" },
              { value: CARD_CATEGORIES.TRAINER, label: "Trainer" },
              { value: CARD_CATEGORIES.ENERGY, label: "Energi" },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`cat-${option.value}`}
                />
                <Label
                  htmlFor={`cat-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </section>

        {/* Regulation */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-center border-b pb-2">
            Regulasi
          </h3>
          <RadioGroup
            value={filters.regulation}
            onValueChange={(v) =>
              updateFilter("regulation", v as RegulationType)
            }
            className="space-y-2"
          >
            {[
              { value: "standard", label: "Standar" },
              { value: "expanded", label: "Luas" },
              { value: "other", label: "Lainnya" },
              { value: "all", label: "Semua" },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`reg-${option.value}`}
                />
                <Label
                  htmlFor={`reg-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </section>

        {/* Special Cards */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-center border-b pb-2">
            Kartu Khusus
          </h3>
          <div className="space-y-2">
            {SPECIAL_CARD_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`special-${option.value}`}
                  checked={filters.specialCards.includes(option.value)}
                  onCheckedChange={() => toggleSpecialCard(option.value)}
                />
                <Label
                  htmlFor={`special-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </section>

        {/* Rarity */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-center border-b pb-2">
            Kelangkaan
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {RARITY_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-1.5">
                <Checkbox
                  id={`rarity-${option.value}`}
                  checked={filters.rarities.includes(option.value)}
                  onCheckedChange={() => toggleRarity(option.value)}
                  className="h-3.5 w-3.5"
                />
                <Label
                  htmlFor={`rarity-${option.value}`}
                  className="text-xs cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </section>

        {/* Illustrator */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-center border-b pb-2">
            Nama Ilustrator
          </h3>
          <Input
            placeholder="Nama ilustrator dan lainnya"
            value={filters.illustrator}
            onChange={(e) => updateFilter("illustrator", e.target.value)}
          />
        </section>

        {/* Reset Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            onFiltersChange({
              search: "",
              category: "all",
              regulation: "all",
              setId: undefined,
              rarities: [],
              specialCards: [],
              illustrator: "",
            })
          }
        >
          Reset Filter
        </Button>
      </div>
    </ScrollArea>
  );
}
