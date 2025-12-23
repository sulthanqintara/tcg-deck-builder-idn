import { type Card as CardType } from "@/lib/data";

interface AttacksProps {
  attacks: CardType["attacks"];
}

export function Attacks({ attacks }: AttacksProps) {
  if (!attacks || attacks.length === 0) return null;

  return (
    <div className="space-y-4">
      {attacks.map((attack, idx) => (
        <div
          key={`attack-${idx}`}
          className="space-y-2 border-b border-border last:border-0 pb-4 last:pb-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {attack.cost.map((cost, i) => (
                  <div
                    key={i}
                    title={cost}
                    className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold border border-foreground/10 shadow-sm relative overflow-hidden"
                  >
                    <span className="z-10">{cost.charAt(0)}</span>
                  </div>
                ))}
              </div>
              <span className="font-bold text-lg transition-colors">
                {attack.name}
              </span>
            </div>
            <span className="font-bold text-xl">{attack.damage}</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {attack.text}
          </p>
        </div>
      ))}
    </div>
  );
}
