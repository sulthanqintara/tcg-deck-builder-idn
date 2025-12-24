"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  type CardFilters,
  type CardCategory,
  type RegulationType,
  DEFAULT_FILTERS,
} from "@/lib/types";
import {
  SearchFilter,
  CardTypeFilter,
  RegulationFilter,
  ElementFilter,
  SpecialCardsFilter,
  RarityFilter,
  IllustratorFilter,
} from "./filter-dialog";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CardFilters;
  onFiltersChange: (filters: CardFilters) => void;
}

export function FilterDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: FilterDialogProps) {
  const updateFilter = <K extends keyof CardFilters>(
    key: K,
    value: CardFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (
    key: "rarities" | "specialCards" | "energyTypes",
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const handleReset = () => {
    onFiltersChange({ ...DEFAULT_FILTERS, regulation: "all" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle>Filter Cards</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            <SearchFilter
              value={filters.search}
              onChange={(v) => updateFilter("search", v)}
            />

            <CardTypeFilter
              value={filters.category}
              onChange={(v) => updateFilter("category", v as CardCategory)}
            />

            <RegulationFilter
              value={filters.regulation}
              onChange={(v) => updateFilter("regulation", v as RegulationType)}
            />

            <ElementFilter
              selected={filters.energyTypes}
              onToggle={(v) => toggleArrayFilter("energyTypes", v)}
            />

            <SpecialCardsFilter
              selected={filters.specialCards}
              onToggle={(v) => toggleArrayFilter("specialCards", v)}
            />

            <RarityFilter
              selected={filters.rarities}
              onToggle={(v) => toggleArrayFilter("rarities", v)}
            />

            <IllustratorFilter
              value={filters.illustrator}
              onChange={(v) => updateFilter("illustrator", v)}
            />
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t shrink-0 flex flex-col gap-2">
          <Button variant="outline" className="gap-2" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Reset Filters
          </Button>
          <Button onClick={() => onOpenChange(false)}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
