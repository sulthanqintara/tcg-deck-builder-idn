"use client";

import Image from "next/image";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Card as CardType } from "@/lib/data";

interface CardGridProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredCards: CardType[];
  onCardClick: (card: CardType) => void;
}

export function CardGrid({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  filteredCards,
  onCardClick,
}: CardGridProps) {
  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden min-h-0">
      <div className="flex flex-col gap-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Deck Builder</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cards..."
              className="pl-8 bg-secondary/50 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pokémon">Pokémon</TabsTrigger>
              <TabsTrigger value="trainer">Trainer</TabsTrigger>
              <TabsTrigger value="energy">Energy</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto -mr-4 pr-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-10 p-8">
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <Card
                key={card.id}
                className="group relative overflow-hidden transition-all hover:ring-2 hover:ring-primary cursor-pointer border-0 bg-transparent"
                onClick={() => onCardClick(card)}
              >
                <CardContent className="p-0 aspect-[2.5/3.5] relative">
                  <Image
                    src={card.images.small}
                    alt={card.name}
                    fill
                    className="object-contain"
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                </CardContent>
                <div className="p-2 text-center text-xs text-muted-foreground truncate">
                  {card.name}
                </div>
              </Card>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No cards found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
