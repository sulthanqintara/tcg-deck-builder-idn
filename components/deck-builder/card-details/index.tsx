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
import { Header } from "./Header";
import { Abilities } from "./Abilities";
import { Attacks } from "./Attacks";
import { Stats } from "./Stats";
import { Footer } from "./Footer";
import { Legalities } from "./Legalities";
import { TrainerText } from "./TrainerText";

interface CardDetailsDialogProps {
  card: CardType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetailsDialog({
  card,
  open,
  onOpenChange,
}: CardDetailsDialogProps) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = card ? card.images.large || card.images.small : "";

  useEffect(() => {
    setImageError(false);
  }, [imageSrc]);

  if (!card) return null;

  const isPokemon = card.supertype === "Pokémon";
  const isTrainer = card.supertype === "Trainer";

  // For trainers, try to get effect from first ability
  const trainerEffect = isTrainer && card.abilities?.[0]?.effect;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl min-w-[90vw] overflow-hidden bg-background">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
          <DialogDescription>{card.name}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[85vh]">
          {/* Left Column: Image */}
          <div className="w-full md:w-1/2 bg-neutral-900/5 p-6 flex items-center justify-center relative">
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
