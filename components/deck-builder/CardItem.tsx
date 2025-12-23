import { memo, useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { type Card as CardType } from "@/lib/types";
import { CardCounter } from "./CardCounter";

interface CardItemProps {
  card: CardType;
  count: number;
  onUpdateCount: (card: CardType, count: number) => void;
  onClick: (card: CardType) => void;
}

function CardItemComponent({
  card,
  count,
  onUpdateCount,
  onClick,
}: CardItemProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [card.images.small]);

  return (
    <div className="flex flex-col gap-2">
      <Card
        className="group relative overflow-hidden transition-all hover:ring-2 hover:ring-primary cursor-pointer border-0 bg-transparent p-0"
        onClick={() => onClick(card)}
      >
        <CardContent className="p-0 relative">
          <Image
            src={
              imageError
                ? "/Gemini_Generated_Image_ro97daro97daro97.webp"
                : card.images.small
            }
            alt={card.name}
            width={240}
            height={335}
            className="w-full h-auto object-contain"
            loading="lazy"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
            onError={() => setImageError(true)}
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

// Custom equality check: only re-render if card.id or count changes
function areEqual(prevProps: CardItemProps, nextProps: CardItemProps): boolean {
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.count === nextProps.count
  );
}

export const CardItem = memo(CardItemComponent, areEqual);
