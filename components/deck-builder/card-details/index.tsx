import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Card as CardType } from "@/lib/types";
import { CARD_SUPERTYPES } from "@/lib/constants";
import { Header } from "./Header";
import { Abilities } from "./Abilities";
import { Attacks } from "./Attacks";
import { Stats } from "./Stats";
import { Footer } from "./Footer";
import { Legalities } from "./Legalities";
import { TrainerText } from "./TrainerText";
import { CardCounter } from "../CardCounter";

interface CardDetailsDialogProps {
  card: CardType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count?: number;
  onUpdateCount?: (card: CardType, count: number) => void;
}

export function CardDetailsDialog({
  card,
  open,
  onOpenChange,
  count,
  onUpdateCount,
}: CardDetailsDialogProps) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = card ? card.images.large || card.images.small : "";

  useEffect(() => {
    setImageError(false);
  }, [imageSrc]);

  if (!card) return null;

  const isPokemon = card.supertype === CARD_SUPERTYPES.POKEMON;
  const isTrainer = card.supertype === CARD_SUPERTYPES.TRAINER;

  // For trainers, try to get effect from effectText first, then fallback to first ability
  const trainerEffect =
    isTrainer && (card.effectText || card.abilities?.[0]?.effect);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl 2xl:min-w-[60vw] min-w-[90vw] overflow-hidden bg-background">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
          <DialogDescription>
            {isTrainer ? card.subtype : card.name}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[85vh]">
          {/* Left Column: Image */}
          <div className="w-full md:w-1/2 bg-neutral-900/5 p-6 flex flex-col items-center justify-center gap-6 relative">
            <div className="relative aspect-[2.5/3.5] w-full max-w-[360px] shadow-2xl rounded-xl overflow-hidden transform transition-transform hover:scale-105 duration-300">
              <Image
                src={
                  imageError
                    ? "/Gemini_Generated_Image_ro97daro97daro97.webp"
                    : imageSrc
                }
                alt={card.name}
                fill
                className="object-contain"
                priority
                onError={() => setImageError(true)}
              />
            </div>
            {/* Deck Controls */}
            {typeof count === "number" && onUpdateCount && (
              <div className="w-full max-w-[360px]">
                <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border shadow-sm space-y-2">
                  <p className="text-sm font-medium text-center text-muted-foreground">
                    Deck Quantity
                  </p>
                  <CardCounter
                    card={card}
                    count={count}
                    onUpdateCount={onUpdateCount}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col gap-5 text-foreground bg-background">
            <Header card={card} />

            {/* Pokémon-specific details */}
            {isPokemon && (
              <>
                <Abilities abilities={card.abilities} />
                <Attacks attacks={card.attacks} />
                <Stats card={card} />
              </>
            )}

            {/* Trainer-specific details */}
            {isTrainer && <TrainerText effect={trainerEffect || undefined} />}

            {/* Energy cards don't need additional content beyond header */}

            <div className="space-y-4 mt-auto pt-4 border-t border-border">
              <Footer card={card} />
              <Legalities regulationMark={card.regulationMark} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
