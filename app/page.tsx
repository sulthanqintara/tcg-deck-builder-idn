"use client";

import { useDeckBuilder } from "@/hooks/use-deck-builder";
import { CardGrid } from "@/components/deck-builder/CardGrid";
import { DeckSidebar } from "@/components/deck-builder/DeckSidebar";

export default function Home() {
  const {
    searchQuery,
    setSearchQuery,
    deck,
    activeTab,
    setActiveTab,
    filteredCards,
    deckStats,
    addToDeck,
    removeFromDeck,
    clearDeck,
    copyDeckList,
  } = useDeckBuilder();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-background">
      <CardGrid
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredCards={filteredCards}
        onCardClick={addToDeck}
      />
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
