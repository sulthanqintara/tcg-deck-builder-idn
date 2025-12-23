import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CardGridHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function CardGridHeader({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
}: CardGridHeaderProps) {
  return (
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pokémon">Pokémon</TabsTrigger>
            <TabsTrigger value="trainer">Trainer</TabsTrigger>
            <TabsTrigger value="energy">Energy</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
