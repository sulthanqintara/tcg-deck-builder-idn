import { type Card as CardType } from "@/lib/types";

interface StatsProps {
  card: CardType;
}

export function Stats({ card }: StatsProps) {
  return (
    <div className="grid grid-cols-1 gap-y-3 gap-x-6 text-sm py-4 border-t border-border">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground font-medium">Weakness</span>
        <div className="flex gap-2 font-medium">
          {card.weaknesses?.map((w, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-secondary/30 px-2 py-0.5 rounded"
            >
              {w.type} <span className="text-red-500">{w.value}</span>
            </span>
          )) || "N/A"}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground font-medium">Resistance</span>
        <div className="flex gap-2 font-medium">
          {card.resistances?.map((r, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-secondary/30 px-2 py-0.5 rounded"
            >
              {r.type} <span className="text-green-500">{r.value}</span>
            </span>
          )) || "N/A"}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground font-medium">Retreat Cost</span>
        <div className="flex gap-1">
          {card.retreat ? (
            Array.from({ length: card.retreat }).map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold border border-foreground/10"
              >
                C
              </div>
            ))
          ) : (
            <span className="text-muted-foreground">None</span>
          )}
        </div>
      </div>
    </div>
  );
}
