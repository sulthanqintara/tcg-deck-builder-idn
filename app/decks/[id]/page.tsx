"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { mockCards, type Card as CardType } from "@/lib/data";
import { CardDetailsDialog } from "@/components/deck-builder/card-details";

interface DeckItem extends CardType {
  count: number;
}

interface Deck {
  id: string;
  name: string;
  author: string;
  cards: DeckItem[];
  description: string;
}

// Mock deck data generator
const getMockDeck = (id: string): Deck => {
  // Return a random selection of cards for demo
  const deck: DeckItem[] = [];
  const pokemon = mockCards.filter((c) => c.supertype === "Pokémon");
  const trainers = mockCards.filter((c) => c.supertype === "Trainer");
  const energy = mockCards.filter((c) => c.supertype === "Energy");

  // Add some cards
  if (pokemon[0]) deck.push({ ...pokemon[0], count: 4 });
  if (pokemon[1]) deck.push({ ...pokemon[1], count: 2 });
  if (trainers[0]) deck.push({ ...trainers[0], count: 4 });
  if (trainers[1]) deck.push({ ...trainers[1], count: 3 });
  if (energy[0]) deck.push({ ...energy[0], count: 10 });

  return {
    id,
    name: "World Championship Deck 2025",
    author: "Ash Ketchum",
    cards: deck,
    description:
      "A powerful deck focused on high damage output and consistency.",
  };
};

export default function DeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  useEffect(() => {
    // Simulate fetch
    setDeck(getMockDeck(id));
  }, [id]);

  if (!deck) return <div className="p-8 text-center">Loading deck...</div>;

  const deckStats = {
    pokemon: deck.cards
      .filter((c) => c.supertype === "Pokémon")
      .reduce((acc, c) => acc + c.count, 0),
    trainer: deck.cards
      .filter((c) => c.supertype === "Trainer")
      .reduce((acc, c) => acc + c.count, 0),
    energy: deck.cards
      .filter((c) => c.supertype === "Energy")
      .reduce((acc, c) => acc + c.count, 0),
  };
  const totalCards = deckStats.pokemon + deckStats.trainer + deckStats.energy;

  const copyDeckList = () => {
    let text = "";
    // Simplified logic similar to builder
    const pokemon = deck.cards.filter((c) => c.supertype === "Pokémon");
    if (pokemon.length > 0) {
      text += `Pokémon: ${deckStats.pokemon}\n`;
      pokemon.forEach(
        (c) => (text += `${c.count} ${c.name} ${c.set.ptcgoCode} ${c.number}\n`)
      );
      text += "\n";
    }
    // ... add trainer/energy
    const trainer = deck.cards.filter((c) => c.supertype === "Trainer");
    if (trainer.length > 0) {
      text += `Trainer: ${deckStats.trainer}\n`;
      trainer.forEach(
        (c) => (text += `${c.count} ${c.name} ${c.set.ptcgoCode} ${c.number}\n`)
      );
      text += "\n";
    }
    const energy = deck.cards.filter((c) => c.supertype === "Energy");
    if (energy.length > 0) {
      text += `Energy: ${deckStats.energy}\n`;
      energy.forEach(
        (c) => (text += `${c.count} ${c.name} ${c.set.ptcgoCode} ${c.number}\n`)
      );
    }

    navigator.clipboard.writeText(text);
    toast.success("Deck list copied to clipboard!");
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{deck.name}</h1>
          <p className="text-muted-foreground text-sm">
            Created by{" "}
            <span className="text-primary font-medium">{deck.author}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyDeckList} className="gap-2">
            <Copy className="h-4 w-4" /> Copy
          </Button>
          <Button variant="default" className="gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg">Deck List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {["Pokémon", "Trainer", "Energy"].map((type) => {
                const cardsOfType = deck.cards.filter(
                  (c) => c.supertype === type
                );
                if (cardsOfType.length === 0) return null;
                const count =
                  deckStats[type.toLowerCase() as keyof typeof deckStats];

                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-3 pb-1 border-b">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                        {type}
                      </h3>
                      <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-mono">
                        {count}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cardsOfType.map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors cursor-pointer"
                          onClick={() => setSelectedCard(card)}
                        >
                          <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-sm shadow-sm">
                            <Image
                              src={card.images.small}
                              alt={card.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {card.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {card.set.ptcgoCode} {card.number}
                            </div>
                          </div>
                          <div className="font-bold text-lg w-8 text-center">
                            {card.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Deck Composition</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Pokémon</span>
                    <span className="text-muted-foreground">
                      {deckStats.pokemon} (
                      {Math.round((deckStats.pokemon / totalCards) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-md overflow-hidden">
                    <div
                      className="h-full bg-chart-1"
                      style={{
                        width: `${(deckStats.pokemon / totalCards) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Trainer</span>
                    <span className="text-muted-foreground">
                      {deckStats.trainer} (
                      {Math.round((deckStats.trainer / totalCards) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-md overflow-hidden">
                    <div
                      className="h-full bg-chart-2"
                      style={{
                        width: `${(deckStats.trainer / totalCards) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Energy</span>
                    <span className="text-muted-foreground">
                      {deckStats.energy} (
                      {Math.round((deckStats.energy / totalCards) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-md overflow-hidden">
                    <div
                      className="h-full bg-chart-3"
                      style={{
                        width: `${(deckStats.energy / totalCards) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
