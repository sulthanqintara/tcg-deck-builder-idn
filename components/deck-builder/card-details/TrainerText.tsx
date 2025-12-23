import { type Card as CardType } from "@/lib/data";

interface TrainerTextProps {
  rules?: string[];
}

export function TrainerText({ rules }: TrainerTextProps) {
  if (!rules || rules.length === 0) return null;

  return (
    <div className="space-y-2 p-4 bg-secondary/10 rounded-lg">
      {rules.map((rule, idx) => (
        <p key={idx} className="text-sm leading-relaxed text-foreground">
          {rule}
        </p>
      ))}
    </div>
  );
}
