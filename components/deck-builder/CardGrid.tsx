"use client";

import { useState, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { type Card, type CardFilters, type DeckItem } from "@/lib/types";
import { CardGridHeader } from "./CardGridHeader";
import { CardItem } from "./CardItem";
import { CardDetailsDialog } from "./card-details";

interface CardGridProps {
  filters: CardFilters;
  setFilters: (filters: CardFilters) => void;
  cards: Card[];
  isLoading: boolean;
  error?: string;
  deck: DeckItem[];
  onUpdateCount: (card: Card, count: number) => void;
}

export function CardGrid({
  filters,
  setFilters,
  cards,
  isLoading,
  error,
  deck,
  onUpdateCount,
}: CardGridProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // O(1) lookup map instead of O(n) find() per card
  const deckCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of deck) {
      map.set(item.id, item.count);
    }
    return map;
  }, [deck]);

  // Stable callback for card selection
  const handleCardClick = useCallback((card: Card) => {
    setSelectedCard(card);
  }, []);

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden min-h-0">
      <CardGridHeader
        filters={filters}
        setFilters={setFilters}
        cardCount={cards.length}
        isLoading={isLoading}
      />

      <div className="flex-1 overflow-y-auto -mr-4 pr-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading cards...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-10 p-8">
            {cards.length > 0 ? (
              cards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  count={deckCountMap.get(card.id) ?? 0}
                  onUpdateCount={onUpdateCount}
                  onClick={handleCardClick}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full col-span-full">
                <p className="text-muted-foreground">No cards found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CardDetailsDialog
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      />
    </div>
  );
}
