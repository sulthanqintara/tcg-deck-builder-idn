"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import {
  Plus,
  Minus,
  Trash2,
  Copy,
  Save,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Card, type DeckItem, type DeckStats } from "@/lib/types";
import { CARD_SUPERTYPES } from "@/lib/constants";

interface DeckSidebarProps {
  deck: DeckItem[];
  deckStats: DeckStats;
  onUpdateCount: (card: Card, count: number) => void;
  onRemoveFromDeck: (cardId: string) => void;
  onClearDeck: () => void;
  onCopyDeck: () => void;
  onSaveDeck?: () => void;
}

interface DeckCardRowProps {
  card: DeckItem;
  onUpdateCount: (card: Card, count: number) => void;
}

// Helper to check if a card is Basic Energy (no 4-copy limit)
const isBasicEnergy = (card: Card) =>
  card.category === "Energy" && card.subtype === "Basic";

function DeckCardRow({ card, onUpdateCount }: DeckCardRowProps) {
  const [imageError, setImageError] = useState(false);
  const basicEnergy = isBasicEnergy(card);

  useEffect(() => {
    setImageError(false);
  }, [card.images.small]);

  return (
    <div className="group flex items-center gap-2 p-1.5 rounded-md hover:bg-secondary/50 transition-colors">
      <div className="relative h-10 w-8 shrink-0">
        <Image
          src={
            imageError
              ? "/Gemini_Generated_Image_ro97daro97daro97.webp"
              : card.images.small
          }
          alt={card.name}
          fill
          className="object-cover rounded-sm"
          onError={() => setImageError(true)}
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{card.name}</div>
        <div className="text-[10px] text-muted-foreground">
          {card.set.id.toUpperCase()} {card.number}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="hover-destructive"
          size="icon"
          onClick={() => onUpdateCount(card, card.count - 1)}
          disabled={card.count === 0}
          className="h-6 w-6 rounded-sm hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-4 text-center text-sm font-medium">
          {card.count}
        </span>
        <Button
          variant="hover-primary"
          size="icon"
          onClick={() => onUpdateCount(card, card.count + 1)}
          disabled={!basicEnergy && card.count >= 4}
          className="h-6 w-6 rounded-sm hover:bg-primary/10 hover:text-primary text-muted-foreground"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function DeckSidebar({
  deck,
  deckStats,
  onUpdateCount,
  onRemoveFromDeck,
  onClearDeck,
  onCopyDeck,
  onSaveDeck,
}: DeckSidebarProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div className="w-full lg:w-96 border-l bg-card/50 flex flex-col h-[40vh] lg:h-full">
      <div className="p-4 border-b flex items-center justify-between bg-card">
        <div>
          <h2 className="font-semibold text-lg">Current Deck</h2>
          <div className="text-xs text-muted-foreground flex gap-2">
            <span>{deckStats.total}/60 Cards</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="flex border rounded-md mr-2">
            <Button
              size="icon"
              variant={viewMode === "list" ? "secondary" : "ghost"}
              className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              className="h-8 w-8 rounded-l-none border-l"
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onClearDeck}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={onCopyDeck}
            title="Copy for PTCGL"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="default"
            className="h-8 w-8"
            onClick={onSaveDeck}
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {deck.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm text-center">
            <p>Your deck is empty.</p>
            <p>Click cards on the left to add them.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {[
              CARD_SUPERTYPES.POKEMON,
              CARD_SUPERTYPES.TRAINER,
              CARD_SUPERTYPES.ENERGY,
            ].map((type) => {
              const cardsOfType = deck.filter((c) => c.supertype === type);
              if (cardsOfType.length === 0) return null;

              return (
                <div key={type}>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex justify-between">
                    {type}{" "}
                    <span>
                      {deckStats[type.toLowerCase() as keyof typeof deckStats]}
                    </span>
                  </h3>
                  {viewMode === "list" ? (
                    <div className="space-y-1">
                      {cardsOfType.map((card) => (
                        <DeckCardRow
                          key={card.id}
                          card={card}
                          onUpdateCount={onUpdateCount}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {cardsOfType.map((card) => (
                        <div key={card.id} className="group relative">
                          <div className="relative aspect-[2.5/3.5] w-full overflow-hidden rounded-sm hover:ring-2 hover:ring-primary transition-all">
                            <Image
                              src={card.images.small}
                              alt={card.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-1">
                              <div className="flex items-center gap-2 bg-secondary/90 rounded-full px-2 py-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    onUpdateCount(card, card.count - 1)
                                  }
                                  disabled={card.count === 0}
                                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/20"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-bold text-white text-sm">
                                  {card.count}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    onUpdateCount(card, card.count + 1)
                                  }
                                  disabled={
                                    !isBasicEnergy(card) && card.count >= 4
                                  }
                                  className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/20"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm backdrop-blur-sm pointer-events-none group-hover:opacity-0 transition-opacity">
                              {card.count}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t bg-card">
        <div className="flex gap-2 text-xs mb-2">
          <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden flex">
            <div
              className="bg-chart-1"
              style={{ width: `${(deckStats.pokemon / 60) * 100}%` }}
            />
            <div
              className="bg-chart-2"
              style={{ width: `${(deckStats.trainer / 60) * 100}%` }}
            />
            <div
              className="bg-chart-3"
              style={{ width: `${(deckStats.energy / 60) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-chart-1" /> Pokémon
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-chart-2" /> Trainer
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-chart-3" /> Energy
          </div>
        </div>
      </div>
    </div>
  );
}
