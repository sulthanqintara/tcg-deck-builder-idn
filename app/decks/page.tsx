"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, LayoutGrid, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockCards } from "@/lib/data";

// Generate some mock decks
const mockDecks = [
  {
    id: "deck-1",
    name: "Charizard ex Reign",
    count: 60,
    colors: ["Fire", "Darkness"],
    coverCard: mockCards.find(c => c.name === "Cinderace")?.images.small || "https://placehold.co/200x280/png",
    updatedAt: "2 days ago"
  },
  {
    id: "deck-2",
    name: "Lost Box",
    count: 60,
    colors: ["Psychic", "Water", "Metal"],
    coverCard: mockCards.find(c => c.name === "Mega Gengar ex")?.images.small || "https://placehold.co/200x280/png",
    updatedAt: "5 days ago"
  },
  {
     id: "deck-3",
     name: "Gardevoir ex",
     count: 58,
     colors: ["Psychic"],
     coverCard: "https://images.pokemontcg.io/sv1/86.png",
     updatedAt: "1 week ago"
  }
];

export default function DecksPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">My Decks</h1>
           <p className="text-muted-foreground">Manage and share your created decks.</p>
        </div>
        <Link href="/">
            <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create New Deck
            </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2 bg-secondary/30 p-1 rounded-lg w-full md:w-96 border border-transparent focus-within:border-primary/50 transition-colors">
         <Search className="h-4 w-4 text-muted-foreground ml-2" />
         <Input placeholder="Search decks..." className="border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockDecks.map((deck) => (
          <Link href={`/decks/${deck.id}`} key={deck.id} className="group">
            <Card className="overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all hover:shadow-lg h-full flex flex-col">
              <div className="aspect-video relative overflow-hidden bg-secondary">
                  <Image 
                    src={deck.coverCard} 
                    alt={deck.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex gap-1 mb-1">
                          {deck.colors.map(color => (
                              <div key={color} className="h-2 w-2 rounded-full bg-white/80" title={color} />
                          ))}
                      </div>
                  </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">{deck.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1">
                 <p className="text-sm text-muted-foreground">{deck.count} Cards</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 text-xs text-muted-foreground border-t bg-secondary/20 mt-auto flex items-center gap-2">
                  <LayoutGrid className="h-3 w-3" />
                  <span>Updated {deck.updatedAt}</span>
              </CardFooter>
            </Card>
          </Link>
        ))}
        
        {/* New Deck Card Placeholder */}
         <Link href="/" className="group flex flex-col">
            <div className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 rounded-xl flex-1 flex flex-col items-center justify-center gap-4 min-h-[250px] bg-secondary/5 hover:bg-secondary/10 transition-all">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                    <h3 className="font-semibold text-lg">Create New</h3>
                    <p className="text-sm text-muted-foreground">Build a new deck from scratch</p>
                </div>
            </div>
         </Link>
      </div>
    </div>
  );
}
