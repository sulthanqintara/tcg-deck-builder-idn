import { type Card as CardType } from "@/lib/data";

interface HeaderProps {
  card: CardType;
}

export function Header({ card }: HeaderProps) {
  return (
    <div className="space-y-2 border-b border-border pb-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {card.name}
            </h2>
            {card.hp && (
              <span className="text-xl font-semibold text-muted-foreground flex items-center gap-1">
                <span className="text-sm uppercase tracking-wide text-muted-foreground font-normal">
                  HP
                </span>
                {card.hp}
                <span className="text-sm text-foreground ml-1">
                  {card.types?.[0]}
                </span>
              </span>
            )}
          </div>
          <div className="text-base font-medium text-muted-foreground flex items-center gap-2">
            <span>{card.supertype}</span>
            {card.subtypes && card.subtypes.length > 0 && (
              <>
                <span>•</span>
                <span>{card.subtypes.join(", ")}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
