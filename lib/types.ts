// Card types aligned with TCGDex SDK structure
// See: https://tcgdex.dev/sdks/typescript
import { CARD_CATEGORIES, CARD_SUPERTYPES } from "@/lib/constants";

export interface CardImage {
  small: string;
  large: string;
}

export interface CardSet {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
}

export interface CardAttack {
  name: string;
  cost?: string[];
  damage?: string;
  effect?: string;
}

export interface CardAbility {
  name: string;
  type: string;
  effect: string;
}

export interface CardWeakRes {
  type: string;
  value?: string;
}

// Main Card interface - compatible with TCGDex
export interface Card {
  id: string;
  localId: string;
  name: string;
  category: (typeof CARD_CATEGORIES)[keyof typeof CARD_CATEGORIES];
  subtype?: string; // Trainer: Item/Supporter/Stadium/Pokemon Tool, Energy: Basic/Special
  effectText?: string; // Main effect text for Trainer/Energy cards
  image?: string;
  illustrator?: string;
  rarity?: string;
  regulationMark?: string;
  hp?: number;
  types?: string[];
  stage?: string; // Pokemon only: Basic, Stage 1, Stage 2, V, VMAX, VSTAR, GX, ex, etc.
  attacks?: CardAttack[];
  abilities?: CardAbility[];
  weaknesses?: CardWeakRes[];
  resistances?: CardWeakRes[];
  retreat?: number;
  set: CardSet;
  // For backwards compat with existing DeckSidebar
  images: CardImage;
  supertype: (typeof CARD_SUPERTYPES)[keyof typeof CARD_SUPERTYPES];
  number: string;
}

// Deck types
export interface DeckItem extends Card {
  count: number;
}

export interface DeckStats {
  pokemon: number;
  trainer: number;
  energy: number;
  total: number;
}

// Filter types for the new UI
export type CardCategory =
  | "all"
  | (typeof CARD_CATEGORIES)[keyof typeof CARD_CATEGORIES];
export type RegulationType = "standard" | "expanded" | "other" | "all";

export interface CardFilters {
  search: string;
  category: CardCategory;
  regulation: RegulationType;
  setId?: string;
  rarities: string[];
  specialCards: string[];
  illustrator: string;
}

export const DEFAULT_FILTERS: CardFilters = {
  search: "",
  category: "all",
  regulation: "standard",
  setId: undefined,
  rarities: [],
  specialCards: [],
  illustrator: "",
};
