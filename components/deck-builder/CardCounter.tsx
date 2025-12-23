import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Card as CardType } from "@/lib/data";

interface CardCounterProps {
  card: CardType;
  count: number;
  onUpdateCount: (card: CardType, count: number) => void;
}

export function CardCounter({ card, count, onUpdateCount }: CardCounterProps) {
  const isBasicEnergy =
    card.supertype === "Energy" && card.subtypes?.includes("Basic");

  const handleInputChange = (value: string) => {
    if (value === "") return;
    const num = parseInt(value);
    const max = isBasicEnergy ? 99 : 4;
    if (!isNaN(num) && num >= 0 && num <= max) {
      onUpdateCount(card, num);
    }
  };

  return (
    <div className="flex items-center justify-center gap-1 bg-secondary/50 rounded-md p-1">
      <Button
        variant="hover-destructive"
        size="icon"
        className="flex-1"
        onClick={() => onUpdateCount(card, Math.max(0, count - 1))}
        disabled={count === 0}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        className="w-12 text-center p-0 border-0 bg-transparent text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        type="number"
        min={0}
        max={isBasicEnergy ? 99 : 4}
        value={count}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      <Button
        variant="hover-primary"
        size="icon"
        className="flex-1"
        onClick={() => onUpdateCount(card, count + 1)}
        disabled={!isBasicEnergy && count >= 4}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
