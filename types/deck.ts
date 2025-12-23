import { type Card as CardType } from "@/lib/data";

export interface DeckItem extends CardType {
  count: number;
}

export interface DeckStats {
  pokemon: number;
  trainer: number;
  energy: number;
  total: number;
}
