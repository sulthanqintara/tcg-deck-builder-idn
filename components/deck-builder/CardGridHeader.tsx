import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type CardFilters, type CardCategory } from "@/lib/types";

interface CardGridHeaderProps {
  filters: CardFilters;
  setFilters: (filters: CardFilters) => void;
  cardCount: number;
  totalCards: number;
  isLoading: boolean;
}

export function CardGridHeader({
  filters,
  setFilters,
  cardCount,
  totalCards,
  isLoading,
}: CardGridHeaderProps) {
  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search });
  };

  const handleCategoryChange = (category: string) => {
    setFilters({ ...filters, category: category as CardCategory });
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
        <Tabs
          value={filters.category}
          onValueChange={handleCategoryChange}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Pokemon">Pokémon</TabsTrigger>
            <TabsTrigger value="Trainer">Trainer</TabsTrigger>
            <TabsTrigger value="Energy">Energy</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
