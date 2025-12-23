"use client";

import { useDeckBuilder } from "@/hooks/use-deck-builder";
import { CardGrid } from "@/components/deck-builder/CardGrid";
import { DeckSidebar } from "@/components/deck-builder/DeckSidebar";
import { FilterSidebar } from "@/components/deck-builder/FilterSidebar";

export default function Home() {
  const {
    filters,
    setFilters,
    deck,
    cards,
    isLoading,
    error,
    deckStats,
    addToDeck,
    removeFromDeck,
    clearDeck,
    copyDeckList,
    setCardCount,
  } = useDeckBuilder();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-background">
      {/* Left Sidebar - Filters */}
      <aside className="hidden lg:block w-72 border-r bg-card/50">
        <FilterSidebar filters={filters} onFiltersChange={setFilters} />
      </aside>

      {/* Main Content - Card Grid */}
      <CardGrid
        filters={filters}
        setFilters={setFilters}
        cards={cards}
        isLoading={isLoading}
        error={error}
        deck={deck}
        onUpdateCount={setCardCount}
      />

      {/* Right Sidebar - Deck */}
      <DeckSidebar
        deck={deck}
        deckStats={deckStats}
        onAddToDeck={addToDeck}
        onRemoveFromDeck={removeFromDeck}
        onClearDeck={clearDeck}
        onCopyDeck={copyDeckList}
      />
    </div>
  );
}
