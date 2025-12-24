import { type Card as CardType } from "@/lib/types";

interface FooterProps {
  card: CardType;
}

export function Footer({ card }: FooterProps) {
  return (
    <>
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Illustrator</span>
          <span className="font-medium max-w-[200px] truncate block text-right">
            {card.illustrator || "Unknown"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Set</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{card.set.name}</span>
            <span className="text-muted-foreground text-xs bg-secondary px-1 py-0.5 rounded">
              {card.set.id.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Number</span>
          <span className="font-medium">{card.number}</span>
        </div>
        {card.rarity && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rarity</span>
            <span className="font-medium bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
              {card.rarity}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/20 p-2 rounded-md justify-between">
        <div className="flex items-center gap-2">
          {card.regulationMark && (
            <span className="bg-white text-black dark:bg-black dark:text-white w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold border border-foreground/20">
              {card.regulationMark}
            </span>
          )}
          <span className="font-medium">Regulation Mark</span>
        </div>
      </div>
    </>
  );
}
