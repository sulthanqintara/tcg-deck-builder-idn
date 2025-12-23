"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { type Card, type CardFilters, type DeckItem } from "@/lib/types";
import { CardGridHeader } from "./CardGridHeader";
import { CardItem } from "./CardItem";
import { CardDetailsDialog } from "./card-details";

interface CardGridProps {
  filters: CardFilters;
  setFilters: (filters: CardFilters) => void;
  cards: Card[];
  totalCards: number;
  isLoading: boolean;
  error?: string;
  deck: DeckItem[];
  onUpdateCount: (card: Card, count: number) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loadMore: () => void;
}

export function CardGrid({
  filters,
  setFilters,
  cards,
  totalCards,
  isLoading,
  error,
  deck,
  onUpdateCount,
  hasNextPage,
  isFetchingNextPage,
  loadMore,
}: CardGridProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, loadMore]);

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden min-h-0">
      <CardGridHeader
        filters={filters}
        setFilters={setFilters}
        cardCount={cards.length}
        totalCards={totalCards}
        isLoading={isLoading}
      />

      <div className="flex-1 overflow-y-auto -mr-4 pr-4">
        {isLoading && cards.length === 0 ? (
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
              <>
                {cards.map((card) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    count={deckCountMap.get(card.id) ?? 0}
                    onUpdateCount={onUpdateCount}
                    onClick={handleCardClick}
                  />
                ))}
                {/* Load more trigger element */}
                <div
                  ref={loadMoreRef}
                  className="col-span-full flex items-center justify-center py-4"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Loading more cards...</span>
                    </div>
                  ) : hasNextPage ? (
                    <span className="text-sm text-muted-foreground">
                      Scroll for more...
                    </span>
                  ) : cards.length > 0 ? (
                    <span className="text-sm text-muted-foreground">
                      All {totalCards} cards loaded
                    </span>
                  ) : null}
                </div>
              </>
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
