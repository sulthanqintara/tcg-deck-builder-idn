import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Card as CardType } from "@/lib/data";
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
  if (!card) return null;

  const isPokemon = card.supertype === "Pokémon";
  const isTrainer = card.supertype === "Trainer";
  const isEnergy = card.supertype === "Energy";

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
                src={card.images.large || card.images.small}
                alt={card.name}
                fill
                className="object-contain"
                priority
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
            {isTrainer && <TrainerText rules={card.rules} />}

            {/* Energy cards don't need additional content beyond header */}

            <div className="space-y-4 mt-auto pt-4 border-t border-border">
              <Footer card={card} />
              <Legalities legalities={card.legalities} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
