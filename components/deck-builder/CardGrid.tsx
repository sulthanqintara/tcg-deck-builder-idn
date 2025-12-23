import { useState } from "react";
import { type Card as CardType } from "@/lib/data";
import { type DeckItem } from "@/types/deck";
import { CardGridHeader } from "./CardGridHeader";
import { CardItem } from "./CardItem";
import { CardDetailsDialog } from "./card-details";

interface CardGridProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredCards: CardType[];
  deck: DeckItem[];
  onUpdateCount: (card: CardType, count: number) => void;
}

export function CardGrid({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  filteredCards,
  deck,
  onUpdateCount,
}: CardGridProps) {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  const getCardCount = (cardId: string) => {
    return deck.find((c) => c.id === cardId)?.count || 0;
  };

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden min-h-0">
      <CardGridHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 overflow-y-auto -mr-4 pr-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-10 p-8">
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                count={getCardCount(card.id)}
                onUpdateCount={onUpdateCount}
                onClick={() => setSelectedCard(card)}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full col-span-full">
              <p className="text-muted-foreground">No cards found</p>
            </div>
          )}
        </div>
      </div>

      <CardDetailsDialog
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      />
    </div>
  );
}
