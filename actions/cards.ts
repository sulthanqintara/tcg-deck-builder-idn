"use server";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase.types";
import type { Card, CardFilters, CardAttack, CardAbility } from "@/lib/types";
import type { IdnCardWithRelations } from "@/lib/database.types";
import {
  REGULATION_MARKS,
  CARD_CATEGORIES,
  CARD_SUPERTYPES,
} from "@/lib/constants";

// Create Supabase client for server actions (typed with Database schema)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper to map category to supertype
// Helper to map category to supertype
function mapCategoryToSupertype(
  category: string
): (typeof CARD_SUPERTYPES)[keyof typeof CARD_SUPERTYPES] {
  switch (category?.toLowerCase()) {
    case CARD_CATEGORIES.POKEMON.toLowerCase():
      return CARD_SUPERTYPES.POKEMON;
    case CARD_CATEGORIES.TRAINER.toLowerCase():
      return CARD_SUPERTYPES.TRAINER;
    case CARD_CATEGORIES.ENERGY.toLowerCase():
      return CARD_SUPERTYPES.ENERGY;
    default:
      return CARD_SUPERTYPES.POKEMON;
  }
}

// Type for weakness/resistance JSON data
interface WeakResData {
  type: string;
  value: string;
}

// Map Supabase IdnCard to our Card interface
function mapIdnCardToCard(idnCard: IdnCardWithRelations): Card {
  // Convert attacks from normalized table format to Card format
  const attacks: CardAttack[] | undefined = idnCard.idn_card_attacks?.length
    ? idnCard.idn_card_attacks
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((a) => ({
          name: a.name,
          cost: a.cost ?? undefined,
          damage: a.damage ?? undefined,
          effect: a.effect ?? undefined,
        }))
    : undefined;

  // Convert abilities from normalized table format to Card format
  const abilities: CardAbility[] | undefined = idnCard.idn_card_abilities
    ?.length
    ? idnCard.idn_card_abilities
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((a) => ({
          name: a.name,
          type: a.type ?? "Ability",
          effect: a.effect,
        }))
    : undefined;

  // Parse weakness/resistance from JSON
  const weakness = idnCard.weakness as WeakResData | null;
  const resistance = idnCard.resistance as WeakResData | null;

  return {
    id: idnCard.id,
    localId: idnCard.local_id,
    name: idnCard.name,
    category: idnCard.category as Card["category"],
    supertype: mapCategoryToSupertype(idnCard.category),
    image: idnCard.image_url,
    illustrator: idnCard.illustrator ?? undefined,
    rarity: idnCard.rarity ?? undefined,
    regulationMark: idnCard.regulation_mark ?? undefined,
    hp: idnCard.hp ?? undefined,
    types: idnCard.types ?? undefined,
    stage: idnCard.stage ?? undefined,
    subtype: idnCard.subtype ?? undefined,
    effectText: idnCard.effect_text ?? undefined,
    attacks,
    abilities,
    weaknesses: weakness ? [weakness] : undefined,
    resistances: resistance ? [resistance] : undefined,
    retreat: idnCard.retreat_cost ?? undefined,
    set: {
      id: idnCard.set_id || "",
      name: idnCard.idn_sets?.name || "",
      logo: idnCard.idn_sets?.logo_url ?? undefined,
    },
    number: idnCard.local_id,
    images: {
      small: idnCard.image_url,
      large: idnCard.image_url,
    },
  };
}

export interface PaginatedFilters extends CardFilters {
  page?: number;
  limit?: number;
}

export interface SearchCardsResult {
  cards: Card[];
  error?: string;
  page: number;
  totalCards: number;
  hasMore: boolean;
}

export async function searchCards(
  filters: PaginatedFilters
): Promise<SearchCardsResult> {
  const page = filters.page ?? 0;
  const limit = filters.limit ?? 50;

  const emptyResult: SearchCardsResult = {
    cards: [],
    page,
    totalCards: 0,
    hasMore: false,
  };

  try {
    // If there's a search term, use the search text table for better matching
    if (filters.search && filters.search.trim()) {
      return await searchCardsWithText(filters, page, limit);
    }

    // Otherwise, use standard query
    return await searchCardsStandard(filters, page, limit);
  } catch (error) {
    console.error("Search error:", error);
    return {
      ...emptyResult,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search cards using the idn_card_search_text table
 * This searches card names, attack names/effects, ability names/effects, and trainer/energy effect text
 */
async function searchCardsWithText(
  filters: PaginatedFilters,
  page: number,
  limit: number
): Promise<SearchCardsResult> {
  const emptyResult: SearchCardsResult = {
    cards: [],
    page,
    totalCards: 0,
    hasMore: false,
  };

  const searchTerm = filters.search!.toLowerCase().trim();

  // First, get matching card IDs from the search text table
  const { data: searchResults, error: searchError } = await supabase
    .from("idn_card_search_text")
    .select("card_id")
    .ilike("search_text", `%${searchTerm}%`);

  if (searchError) {
    console.error("Search text query error:", searchError);
    return { ...emptyResult, error: searchError.message };
  }

  if (!searchResults || searchResults.length === 0) {
    return emptyResult;
  }

  const matchingCardIds = searchResults.map((r) => r.card_id);

  // Now query the cards with all other filters, including related data
  let query = supabase
    .from("idn_cards")
    .select("*, idn_sets(*), idn_card_attacks(*), idn_card_abilities(*)", {
      count: "exact",
    })
    .in("id", matchingCardIds);

  // Apply additional filters
  query = applyFilters(query, filters);

  // Apply pagination
  const from = page * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  // Order by ID for consistency
  query = query.order("id", { ascending: true });

  const { data, count, error } = await query;

  if (error) {
    console.error("Supabase query error:", error);
    return { ...emptyResult, error: error.message };
  }

  const cards = (data || []).map((row) =>
    mapIdnCardToCard(row as IdnCardWithRelations)
  );

  const totalCards = count || 0;

  return {
    cards,
    page,
    totalCards,
    hasMore: from + limit < totalCards,
  };
}

/**
 * Standard search without text search (no search term)
 */
async function searchCardsStandard(
  filters: PaginatedFilters,
  page: number,
  limit: number
): Promise<SearchCardsResult> {
  const emptyResult: SearchCardsResult = {
    cards: [],
    page,
    totalCards: 0,
    hasMore: false,
  };

  // Query cards with related data (attacks, abilities)
  let query = supabase
    .from("idn_cards")
    .select("*, idn_sets(*), idn_card_attacks(*), idn_card_abilities(*)", {
      count: "exact",
    });

  // Apply filters
  query = applyFilters(query, filters);

  // Apply pagination
  const from = page * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  // Order by ID for consistency
  query = query.order("id", { ascending: true });

  const { data, count, error } = await query;

  if (error) {
    console.error("Supabase query error:", error);
    return { ...emptyResult, error: error.message };
  }

  const cards = (data || []).map((row) =>
    mapIdnCardToCard(row as IdnCardWithRelations)
  );

  const totalCards = count || 0;

  return {
    cards,
    page,
    totalCards,
    hasMore: from + limit < totalCards,
  };
}

/**
 * Apply common filters to a query
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: PaginatedFilters) {
  // Category filter
  if (filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  // Set filter
  if (filters.setId) {
    query = query.eq("set_id", filters.setId);
  }

  // Regulation filter
  if (filters.regulation !== "all") {
    switch (filters.regulation) {
      case "standard":
        query = query.in("regulation_mark", REGULATION_MARKS.STANDARD);
        break;
      case "expanded":
        query = query.in("regulation_mark", REGULATION_MARKS.EXPANDED);
        break;
      case "other":
        query = query.or(
          `regulation_mark.is.null,regulation_mark.not.in.(${REGULATION_MARKS.EXPANDED.join(
            ","
          )})`
        );
        break;
    }
  }

  // Rarity filter
  if (filters.rarities.length > 0) {
    if (filters.rarities.includes("none")) {
      const otherRarities = filters.rarities.filter((r) => r !== "none");
      if (otherRarities.length > 0) {
        query = query.or(
          `rarity.is.null,rarity.in.(${otherRarities.join(",")})`
        );
      } else {
        query = query.is("rarity", null);
      }
    } else {
      query = query.in("rarity", filters.rarities);
    }
  }

  // Illustrator filter
  if (filters.illustrator) {
    query = query.ilike("illustrator", `%${filters.illustrator}%`);
  }

  return query;
}

// Get available sets for the product filter
export async function getSets(): Promise<
  { id: string; name: string; logo?: string }[]
> {
  try {
    const { data, error } = await supabase
      .from("idn_sets")
      .select("id, name, logo_url")
      .order("name");

    if (error) {
      console.error("Failed to fetch sets:", error);
      return [];
    }

    return (data || []).map((s) => ({
      id: s.id,
      name: s.name,
      logo: s.logo_url ?? undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch sets:", error);
    return [];
  }
}

// Get a single card by ID (with full data including attacks and abilities)
export async function getCard(cardId: string): Promise<Card | null> {
  try {
    const { data, error } = await supabase
      .from("idn_cards")
      .select("*, idn_sets(*), idn_card_attacks(*), idn_card_abilities(*)")
      .eq("id", cardId)
      .single();

    if (error || !data) {
      console.error("Failed to fetch card:", error);
      return null;
    }

    return mapIdnCardToCard(data as IdnCardWithRelations);
  } catch (error) {
    console.error("Failed to fetch card:", error);
    return null;
  }
}
