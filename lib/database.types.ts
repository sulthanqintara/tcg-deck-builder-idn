// Types matching the Supabase idn_cards and idn_sets tables

export interface IdnSet {
  id: string;
  name: string;
  total_cards: number | null;
  logo_url: string | null;
  created_at: string;
}

export interface IdnCard {
  id: string;
  set_id: string | null;
  local_id: string;
  name: string;
  category: "Pokemon" | "Trainer" | "Energy";
  hp: number | null;
  types: string[] | null;
  regulation_mark: string | null;
  rarity: string | null;
  stage: string | null;
  illustrator: string | null;
  image_url: string;
  attacks: CardAttack[] | null;
  abilities: CardAbility[] | null;
  weakness: CardWeakRes | null;
  resistance: CardWeakRes | null;
  retreat_cost: number | null;
  pokedex_number: number | null;
  flavor_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface CardAttack {
  name: string;
  cost: string[];
  damage: string | null;
  effect: string | null;
}

export interface CardAbility {
  name: string;
  type: string;
  effect: string;
}

export interface CardWeakRes {
  type: string;
  value: string;
}

// Joined type when querying cards with their set
export interface IdnCardWithSet extends IdnCard {
  idn_sets: IdnSet | null;
}
