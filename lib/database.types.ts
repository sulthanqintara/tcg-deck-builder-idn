// Types derived from Supabase generated schema
// To regenerate: npx supabase gen types typescript --linked > lib/supabase.types.ts

import type { Tables } from "./supabase.types";

// Table row types from Supabase (using the Tables helper)
export type IdnCard = Tables<"idn_cards">;
export type IdnSet = Tables<"idn_sets">;
export type IdnCardAttack = Tables<"idn_card_attacks">;
export type IdnCardAbility = Tables<"idn_card_abilities">;
export type IdnCardSearchText = Tables<"idn_card_search_text">;

// Weakness/Resistance type (stored as JSON in database)
export interface CardWeakRes {
  type: string;
  value: string;
}

// Joined type when querying cards with their set
export interface IdnCardWithSet extends IdnCard {
  idn_sets: IdnSet | null;
}

// Joined type with normalized attacks and abilities
export interface IdnCardWithRelations extends IdnCard {
  idn_sets: IdnSet | null;
  idn_card_attacks: IdnCardAttack[];
  idn_card_abilities: IdnCardAbility[];
}

// Alias for backward compatibility
export type IdnCardFull = IdnCardWithRelations;
