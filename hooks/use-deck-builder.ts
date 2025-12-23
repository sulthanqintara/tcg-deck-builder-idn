"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { mockCards, type Card as CardType } from "@/lib/data";
import { type DeckItem, type DeckStats } from "@/types/deck";

export function useDeckBuilder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deck, setDeck] = useState<DeckItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");

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
    const pokemon = deck
      .filter((c) => c.supertype === "Pokémon")
      .reduce((acc, c) => acc + c.count, 0);
    const trainer = deck
      .filter((c) => c.supertype === "Trainer")
      .reduce((acc, c) => acc + c.count, 0);
    const energy = deck
      .filter((c) => c.supertype === "Energy")
      .reduce((acc, c) => acc + c.count, 0);
    return { pokemon, trainer, energy, total: pokemon + trainer + energy };
  }, [deck]);

  const addToDeck = (card: CardType) => {
    setDeck((prev) => {
      const existing = prev.find((c) => c.id === card.id);
      if (existing) {
        if (existing.count >= 4) {
          const isBasicEnergy =
            card.supertype === "Energy" && card.subtypes?.includes("Basic");
          if (!isBasicEnergy) {
            toast.error("Max 4 copies allowed (except Basic Energy)");
            return prev;
          }
        }
        return prev.map((c) =>
          c.id === card.id ? { ...c, count: c.count + 1 } : c
        );
      }
      return [...prev, { ...card, count: 1 }];
    });
  };

  const removeFromDeck = (cardId: string) => {
    setDeck((prev) => {
      const existing = prev.find((c) => c.id === cardId);
      if (existing && existing.count > 1) {
        return prev.map((c) =>
          c.id === cardId ? { ...c, count: c.count - 1 } : c
        );
      }
      return prev.filter((c) => c.id !== cardId);
    });
  };

  const clearDeck = () => setDeck([]);

  const copyDeckList = () => {
    const pokemon = deck.filter((c) => c.supertype === "Pokémon");
    const trainer = deck.filter((c) => c.supertype === "Trainer");
    const energy = deck.filter((c) => c.supertype === "Energy");

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
    deck,
    activeTab,
    setActiveTab,
    filteredCards,
    deckStats,
    addToDeck,
    removeFromDeck,
    clearDeck,
    copyDeckList,
  };
}
