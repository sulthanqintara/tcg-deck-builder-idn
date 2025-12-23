import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { type Card as CardType } from "@/lib/types";
import { CardCounter } from "./CardCounter";

interface CardItemProps {
  card: CardType;
  count: number;
  onUpdateCount: (card: CardType, count: number) => void;
  onClick: () => void;
}

export function CardItem({
  card,
  count,
  onUpdateCount,
  onClick,
}: CardItemProps) {
  return (
    <div className="flex flex-col gap-2">
      <Card
        className="group relative overflow-hidden transition-all hover:ring-2 hover:ring-primary cursor-pointer border-0 bg-transparent p-0"
        onClick={onClick}
      >
        <CardContent className="p-0 relative">
          <Image
            src={card.images.small}
            alt={card.name}
            width={240}
            height={335}
            className="w-full h-auto object-contain"
            loading="lazy"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white font-medium">View Details</span>
          </div>
        </CardContent>
      </Card>

      <CardCounter card={card} count={count} onUpdateCount={onUpdateCount} />
    </div>
  );
}
