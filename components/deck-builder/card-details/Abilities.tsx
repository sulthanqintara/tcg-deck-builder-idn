import { type Card as CardType } from "@/lib/data";

interface AbilitiesProps {
  abilities: CardType["abilities"];
}

export function Abilities({ abilities }: AbilitiesProps) {
  if (!abilities || abilities.length === 0) return null;

  return (
    <div className="space-y-4">
      {abilities.map((ability, idx) => (
        <div
          key={`ability-${idx}`}
          className="space-y-2 p-3 bg-secondary/10 rounded-lg border border-transparent hover:border-border/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider shadow-sm">
              {ability.type}
            </span>
            <span className="font-bold text-lg text-red-700 dark:text-red-400">
              {ability.name}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            {ability.text}
          </p>
        </div>
      ))}
    </div>
  );
}
