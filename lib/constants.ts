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
] as const;

export const ENERGY_TYPE_DATA: Record<
  string,
  { label: string; color: string; textColor?: string }
> = {
  Grass: { label: "Grass", color: "#5A9A4A" },
  Fire: { label: "Fire", color: "#E6573D" },
  Water: { label: "Water", color: "#4A90D9" },
  Lightning: { label: "Lightning", color: "#F5C63D" },
  Psychic: { label: "Psychic", color: "#A65BA0" },
  Fighting: { label: "Fighting", color: "#C9A35A" },
  Darkness: { label: "Darkness", color: "#5A5366", textColor: "#fff" },
  Metal: { label: "Metal", color: "#8A9BA8" },
  Dragon: { label: "Dragon", color: "#C6A832" },
  Colorless: { label: "Colorless", color: "#C4C4B8" },
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
