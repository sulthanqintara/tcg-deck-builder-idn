"use client";

import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { mockCards } from "@/lib/data";
import { type DeckStats } from "@/types/deck";
import { useDeckStore } from "@/store/use-deck-store";

export function useDeckBuilder() {
  const {
    deck,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    addToDeck,
    removeFromDeck,
    setCardCount,
    clearDeck,
  } = useDeckStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const effectiveDeck = isMounted ? deck : [];

  const filteredCards = useMemo(() => {
    return mockCards.filter((card) => {
      const matchesSearch = card.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesTab =
        activeTab === "all" ||
        card.supertype.toLowerCase() === activeTab.toLowerCase();
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

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
        (c) => (text += `${c.count} ${c.name} ${c.set.ptcgoCode} ${c.number}\n`)
      );
      text += "\n";
    }

    if (trainer.length > 0) {
      text += `Trainer: ${deckStats.trainer}\n`;
      trainer.forEach(
        (c) => (text += `${c.count} ${c.name} ${c.set.ptcgoCode} ${c.number}\n`)
      );
      text += "\n";
    }

    if (energy.length > 0) {
      text += `Energy: ${deckStats.energy}\n`;
      energy.forEach(
        (c) => (text += `${c.count} ${c.name} ${c.set.ptcgoCode} ${c.number}\n`)
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
    searchQuery,
    setSearchQuery,
    deck: effectiveDeck,
    activeTab,
    setActiveTab,
    filteredCards,
    deckStats,
    addToDeck,
    removeFromDeck,
    setCardCount,
    clearDeck,
    copyDeckList,
  };
}
