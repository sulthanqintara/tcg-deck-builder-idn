import { type Card as CardType } from "@/lib/data";

interface LegalitiesProps {
  legalities: CardType["legalities"];
}

export function Legalities({ legalities }: LegalitiesProps) {
  if (!legalities) return null;

  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
        <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">
          Legal
        </span>
        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
          Standard
        </span>
      </div>
      <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
        <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">
          Legal
        </span>
        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
          Standard (JP)
        </span>
      </div>
      <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
        <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">
          Legal
        </span>
        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
          Expanded
        </span>
      </div>
      <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
        <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">
          Legal
        </span>
        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
          Expanded (JP)
        </span>
      </div>
    </div>
  );
}
