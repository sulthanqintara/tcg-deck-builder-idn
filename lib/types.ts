// Card types aligned with TCGDex SDK structure
// See: https://tcgdex.dev/sdks/typescript

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
  category: "Pokemon" | "Trainer" | "Energy";
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
  supertype: "Pokémon" | "Trainer" | "Energy";
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
export type CardCategory = "all" | "Pokemon" | "Trainer" | "Energy";
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
  regulation: "all",
  setId: undefined,
  rarities: [],
  specialCards: [],
  illustrator: "",
};

// Rarity options based on Indonesian UI
export const RARITY_OPTIONS = [
  { value: "U", label: "U" },
  { value: "MUR", label: "MUR" },
  { value: "BWR", label: "BWR" },
  { value: "ACE", label: "ACE" },
  { value: "SAR", label: "SAR" },
  { value: "AR", label: "AR" },
  { value: "K", label: "K" },
  { value: "UR", label: "UR" },
  { value: "SR", label: "SR" },
  { value: "RRR", label: "RRR" },
  { value: "RR", label: "RR" },
  { value: "R", label: "R" },
  { value: "C", label: "C" },
  { value: "none", label: "Tanpa Tanda" },
] as const;

// Special card options
export const SPECIAL_CARD_OPTIONS = [
  { value: "single_strike", label: "Serangan Tunggal" },
  { value: "rapid_strike", label: "Serangan Beruntun" },
  { value: "fusion_strike", label: "Bentuk Fusion" },
  { value: "ace_spec", label: "ACE SPEC" },
  { value: "ancient", label: "Purba" },
  { value: "future", label: "Futur" },
] as const;
