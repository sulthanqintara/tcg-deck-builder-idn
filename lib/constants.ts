export const REGULATION_MARKS = {
  STANDARD: ["G", "H", "I"],
  EXPANDED: ["D", "E", "F", "G", "H", "I"],
} as const;

export const CARD_CATEGORIES = {
  POKEMON: "Pokemon",
  TRAINER: "Trainer",
  ENERGY: "Energy",
} as const;

export const CARD_SUPERTYPES = {
  POKEMON: "Pokémon",
  TRAINER: "Trainer",
  ENERGY: "Energy",
} as const;

export const ENERGY_TYPES = [
  "Grass",
  "Fire",
  "Water",
  "Lightning",
  "Psychic",
  "Fighting",
  "Darkness",
  "Metal",
  "Dragon",
  "Colorless",
  "Fairy",
] as const;

export const ENERGY_TYPE_DATA: Record<
  string,
  { label: string; color: string; textColor?: string }
> = {
  Grass: { label: "Grass", color: "#78C850" },
  Fire: { label: "Fire", color: "#F08030" },
  Water: { label: "Water", color: "#6890F0" },
  Lightning: { label: "Lightning", color: "#F8D030" },
  Psychic: { label: "Psychic", color: "#F85888" },
  Fighting: { label: "Fighting", color: "#C03028" },
  Darkness: { label: "Darkness", color: "#705848", textColor: "#fff" },
  Metal: { label: "Metal", color: "#B8B8D0" },
  Dragon: { label: "Dragon", color: "#7038F8", textColor: "#fff" },
  Colorless: { label: "Colorless", color: "#A8A878" },
  Fairy: { label: "Fairy", color: "#EE99AC" },
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

export const TRAINER_SUBTYPES = [
  "Item",
  "Supporter",
  "Stadium",
  "Pokémon Tool",
] as const;
