"use client";

import { useDeckBuilder } from "@/hooks/use-deck-builder";
import { CardGrid } from "@/components/deck-builder/CardGrid";
import { DeckSidebar } from "@/components/deck-builder/DeckSidebar";

export default function Home() {
  const {
    filters,
    setFilters,
    deck,
    cards,
    totalCards,
    isLoading,
    error,
    deckStats,
    removeFromDeck,
    clearDeck,
    copyDeckList,
    setCardCount,
    hasNextPage,
    isFetchingNextPage,
    loadMore,
  } = useDeckBuilder();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-background">
      {/* Main Content - Card Grid */}
      <CardGrid
        filters={filters}
        setFilters={setFilters}
        cards={cards}
        totalCards={totalCards}
        isLoading={isLoading}
        error={error}
        deck={deck}
        onUpdateCount={setCardCount}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        loadMore={loadMore}
      />

      {/* Right Sidebar - Deck */}
      <DeckSidebar
        deck={deck}
        deckStats={deckStats}
        onUpdateCount={setCardCount}
        onRemoveFromDeck={removeFromDeck}
        onClearDeck={clearDeck}
        onCopyDeck={copyDeckList}
      />
    </div>
  );
}
