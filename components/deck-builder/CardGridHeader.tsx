import { useState } from "react";
import { Search, Loader2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type CardFilters, type CardCategory } from "@/lib/types";
import { FilterDialog } from "./FilterDialog";
import { CARD_CATEGORIES } from "@/lib/constants";

interface CardGridHeaderProps {
  filters: CardFilters;
  setFilters: (filters: CardFilters) => void;
  cardCount: number;
  totalCards: number;
  isLoading: boolean;
}

const QUICK_FILTER_OPTIONS: { value: CardCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: CARD_CATEGORIES.POKEMON, label: "Pokémon" },
  { value: CARD_CATEGORIES.TRAINER, label: "Trainer" },
  { value: CARD_CATEGORIES.ENERGY, label: "Energy" },
];

export function CardGridHeader({
  filters,
  setFilters,
  cardCount,
  totalCards,
  isLoading,
}: CardGridHeaderProps) {
  const [filterOpen, setFilterOpen] = useState(false);

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search });
  };

  const handleCategoryChange = (category: CardCategory) => {
    setFilters({ ...filters, category });
  };

  return (
    <div className="flex flex-col gap-4 shrink-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Deck Builder</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isLoading && cardCount === 0 ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : totalCards > 0 ? (
            <span>
              {cardCount} of {totalCards} cards
            </span>
          ) : (
            <span>0 cards</span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            className="pl-8 bg-secondary/50 border-0"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        {/* Quick Filter Toggle Group */}
        <div className="border rounded-md bg-secondary/30 hidden md:flex">
          {QUICK_FILTER_OPTIONS.map((option, index) => (
            <Button
              key={option.value}
              variant={
                filters.category === option.value ? "secondary" : "ghost"
              }
              size="sm"
              className={`
                h-10 px-3 text-xs font-medium
                ${index === 0 ? "rounded-r-none" : ""}
                ${
                  index === QUICK_FILTER_OPTIONS.length - 1
                    ? "rounded-l-none"
                    : ""
                }
                ${
                  index > 0 && index < QUICK_FILTER_OPTIONS.length - 1
                    ? "rounded-none"
                    : ""
                }
                ${index > 0 ? "border-l border-border/50" : ""}
                ${
                  filters.category === option.value
                    ? "bg-secondary shadow-sm"
                    : "hover:bg-secondary/50"
                }
              `}
              onClick={() => handleCategoryChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => setFilterOpen(true)}
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
