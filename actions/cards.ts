"use server";

import { createClient } from "@supabase/supabase-js";
import type { Card, CardFilters } from "@/lib/types";
import type { IdnCard, IdnSet } from "@/lib/database.types";

// Create Supabase client for server actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to map category to supertype
function mapCategoryToSupertype(
  category: string
): "Pokémon" | "Trainer" | "Energy" {
  switch (category?.toLowerCase()) {
    case "pokemon":
      return "Pokémon";
    case "trainer":
      return "Trainer";
    case "energy":
      return "Energy";
    default:
      return "Pokémon";
  }
}

// Map Supabase IdnCard to our Card interface
function mapIdnCardToCard(
  idnCard: IdnCard & { idn_sets: IdnSet | null }
): Card {
  // Convert attacks from database format to Card format
  const attacks = idnCard.attacks?.map((a) => ({
    name: a.name,
    cost: a.cost,
    damage: a.damage ?? undefined,
    effect: a.effect ?? undefined,
  }));

  // Convert abilities from database format to Card format
  const abilities = idnCard.abilities?.map((a) => ({
    name: a.name,
    type: a.type,
    effect: a.effect,
  }));

  return {
    id: idnCard.id,
    localId: idnCard.local_id,
    name: idnCard.name,
    category: idnCard.category,
    supertype: mapCategoryToSupertype(idnCard.category),
    image: idnCard.image_url,
    illustrator: idnCard.illustrator ?? undefined,
    rarity: idnCard.rarity ?? undefined,
    regulationMark: idnCard.regulation_mark ?? undefined,
    hp: idnCard.hp ?? undefined,
    types: idnCard.types ?? undefined,
    stage: idnCard.stage ?? undefined,
    attacks,
    abilities,
    weaknesses: idnCard.weakness ? [idnCard.weakness] : undefined,
    resistances: idnCard.resistance ? [idnCard.resistance] : undefined,
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
    // Build query
    let query = supabase
      .from("idn_cards")
      .select("*, idn_sets(*)", { count: "exact" });

    // Apply filters

    // Search filter (name)
    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

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
          query = query.in("regulation_mark", ["F", "G", "H", "I"]);
          break;
        case "expanded":
          query = query.in("regulation_mark", ["D", "E", "F", "G", "H", "I"]);
          break;
        case "other":
          query = query.or(
            "regulation_mark.is.null,regulation_mark.not.in.(D,E,F,G,H,I)"
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
      mapIdnCardToCard(row as IdnCard & { idn_sets: IdnSet | null })
    );

    const totalCards = count || 0;

    return {
      cards,
      page,
      totalCards,
      hasMore: from + limit < totalCards,
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      ...emptyResult,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
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

// Get a single card by ID
export async function getCard(cardId: string): Promise<Card | null> {
  try {
    const { data, error } = await supabase
      .from("idn_cards")
      .select("*, idn_sets(*)")
      .eq("id", cardId)
      .single();

    if (error || !data) {
      console.error("Failed to fetch card:", error);
      return null;
    }

    return mapIdnCardToCard(data as IdnCard & { idn_sets: IdnSet | null });
  } catch (error) {
    console.error("Failed to fetch card:", error);
    return null;
  }
}
