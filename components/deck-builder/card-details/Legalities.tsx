interface LegalitiesProps {
  regulationMark?: string;
}

export function Legalities({ regulationMark }: LegalitiesProps) {
  // Determine legality based on regulation mark
  const isStandardLegal =
    regulationMark && ["F", "G", "H"].includes(regulationMark.toUpperCase());
  const isExpandedLegal =
    regulationMark &&
    ["D", "E", "F", "G", "H"].includes(regulationMark.toUpperCase());

  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div
        className={`flex items-center justify-between p-2 rounded-md ${
          isStandardLegal
            ? "bg-emerald-500/10 border border-emerald-500/20"
            : "bg-red-500/10 border border-red-500/20"
        }`}
      >
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
            isStandardLegal
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {isStandardLegal ? "Legal" : "Banned"}
        </span>
        <span
          className={`font-medium ${
            isStandardLegal
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-red-700 dark:text-red-400"
          }`}
        >
          Standard
        </span>
      </div>
      <div
        className={`flex items-center justify-between p-2 rounded-md ${
          isExpandedLegal
            ? "bg-emerald-500/10 border border-emerald-500/20"
            : "bg-red-500/10 border border-red-500/20"
        }`}
      >
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
            isExpandedLegal
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {isExpandedLegal ? "Legal" : "Banned"}
        </span>
        <span
          className={`font-medium ${
            isExpandedLegal
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-red-700 dark:text-red-400"
          }`}
        >
          Expanded
        </span>
      </div>
    </div>
  );
}
