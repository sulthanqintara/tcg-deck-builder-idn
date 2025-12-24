"use client";

import { useMemo, useSyncExternalStore, useCallback } from "react";
import { toast } from "sonner";
import { type DeckStats, type Card } from "@/lib/types";
import { useDeckStore } from "@/store/use-deck-store";
import { useInfiniteCards } from "@/hooks/use-cards";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

// Hydration-safe hook to check if we're on the client
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function useDeckBuilder() {
  const { deck, filters, setFilters, removeFromDeck, setCardCount, clearDeck } =
    useDeckStore();

  const isClient = useIsClient();

  const effectiveDeck = useMemo(() => {
    return isClient ? deck : [];
  }, [isClient, deck]);

  // Debounce filters to prevent excessive API calls while typing
  const debouncedFilters = useDebouncedValue(filters, 300);

  // Fetch cards from TCGDex with infinite query (using debounced filters)
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCards(debouncedFilters);

  // Flatten all pages into a single cards array
  const cards = useMemo<Card[]>(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.cards);
  }, [data]);

  // Get total card count from first page
  const totalCards = data?.pages[0]?.totalCards ?? 0;

  // Stable callback for loading more
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const deckStats = useMemo<DeckStats>(() => {
    const pokemon = effectiveDeck
      .filter((c) => c.supertype === "Pokémon")
      .reduce((acc, c) => acc + c.count, 0);
    const trainer = effectiveDeck
      .filter((c) => c.supertype === "Trainer")
      .reduce((acc, c) => acc + c.count, 0);
    const energy = effectiveDeck
      .filter((c) => c.supertype === "Energy")
      .reduce((acc, c) => acc + c.count, 0);
    return { pokemon, trainer, energy, total: pokemon + trainer + energy };
  }, [effectiveDeck]);

  const copyDeckList = () => {
    const pokemon = effectiveDeck.filter((c) => c.supertype === "Pokémon");
    const trainer = effectiveDeck.filter((c) => c.supertype === "Trainer");
    const energy = effectiveDeck.filter((c) => c.supertype === "Energy");

    let text = "";

    if (pokemon.length > 0) {
      text += `Pokémon: ${deckStats.pokemon}\n`;
      pokemon.forEach(
        (c) =>
          (text += `${c.count} ${c.name} ${c.set.id.toUpperCase()} ${
            c.number
          }\n`)
      );
      text += "\n";
    }

    if (trainer.length > 0) {
      text += `Trainer: ${deckStats.trainer}\n`;
      trainer.forEach(
        (c) =>
          (text += `${c.count} ${c.name} ${c.set.id.toUpperCase()} ${
            c.number
          }\n`)
      );
      text += "\n";
    }

    if (energy.length > 0) {
      text += `Energy: ${deckStats.energy}\n`;
      energy.forEach(
        (c) =>
          (text += `${c.count} ${c.name} ${c.set.id.toUpperCase()} ${
            c.number
          }\n`)
      );
    }

    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Deck list copied to clipboard!");
    } else {
      toast.error("Deck is empty");
    }
  };

  // Extract error message from first page or query error
  const errorMessage = error ? String(error) : data?.pages[0]?.error;

  return {
    filters,
    setFilters,
    deck: effectiveDeck,
    cards,
    totalCards,
    isLoading,
    error: errorMessage,
    deckStats,
    removeFromDeck,
    setCardCount,
    clearDeck,
    copyDeckList,
    // Infinite scroll props
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore,
  };
}
