"use client";

import { useMemo, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { type DeckStats, type Card } from "@/lib/types";
import { useDeckStore } from "@/store/use-deck-store";
import { useCards } from "@/hooks/use-cards";

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
  const {
    deck,
    filters,
    setFilters,
    addToDeck,
    removeFromDeck,
    setCardCount,
    clearDeck,
  } = useDeckStore();

  const isClient = useIsClient();

  const effectiveDeck = useMemo(() => {
    return isClient ? deck : [];
  }, [isClient, deck]);

  // Fetch cards from TCGDex
  const { data: cardsData, isLoading, error } = useCards(filters);

  const cards = useMemo<Card[]>(() => {
    return cardsData?.cards || [];
  }, [cardsData]);

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

  return {
    filters,
    setFilters,
    deck: effectiveDeck,
    cards,
    isLoading,
    error: error ? String(error) : cardsData?.error,
    deckStats,
    addToDeck,
    removeFromDeck,
    setCardCount,
    clearDeck,
    copyDeckList,
  };
}
