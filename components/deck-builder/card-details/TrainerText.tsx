interface TrainerTextProps {
  effect?: string;
}

export function TrainerText({ effect }: TrainerTextProps) {
  if (!effect) return null;

  return (
    <div className="space-y-2 p-4 bg-secondary/10 rounded-lg">
      <p className="text-sm leading-relaxed text-foreground">{effect}</p>
    </div>
  );
}
