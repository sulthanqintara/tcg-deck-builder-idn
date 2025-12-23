"use server";

import TCGdex from "@tcgdex/sdk";
import type { Card, CardFilters } from "@/lib/types";

// Initialize TCGDex with Indonesian language
// Note: 'id' is supported by the API but may not be in SDK types yet
const tcgdex = new TCGdex("id" as "en");

// Helper to map TCGDex category to our supertype
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

// Map TCGDex card to our Card interface
function mapCard(tcgCard: Record<string, unknown>, seriesId?: string): Card {
  const category = (tcgCard.category as string) || "Pokemon";
  const set = tcgCard.set as Record<string, unknown> | undefined;
  const localId = (tcgCard.localId as string) || (tcgCard.id as string) || "";
  const setId = set?.id as string | undefined;

  // Use the image URL from the SDK if available
  // Note: Some Indonesian cards are missing images from TCGDex CDN - this is a provider data limitation
  const cardImage = tcgCard.image as string | undefined;
  const seriesPrefix =
    seriesId ||
    (setId?.startsWith("SV") ? "SV" : setId?.startsWith("S") ? "S" : "");

  // Construct fallback URL using Indonesian locale
  const imageBase =
    cardImage ||
    `https://assets.tcgdex.net/id/${seriesPrefix}/${setId}/${localId}`;

  return {
    id: `${setId}-${localId}`,
    localId,
    name: (tcgCard.name as string) || "Unknown",
    category: category as Card["category"],
    supertype: mapCategoryToSupertype(category),
    image: cardImage,
    illustrator: tcgCard.illustrator as string | undefined,
    rarity: tcgCard.rarity as string | undefined,
    regulationMark: tcgCard.regulationMark as string | undefined,
    hp: tcgCard.hp as number | undefined,
    types: tcgCard.types as string[] | undefined,
    stage: tcgCard.stage as string | undefined,
    attacks: tcgCard.attacks as Card["attacks"],
    abilities: tcgCard.abilities as Card["abilities"],
    weaknesses: tcgCard.weaknesses as Card["weaknesses"],
    resistances: tcgCard.resistances as Card["resistances"],
    retreat: tcgCard.retreat as number | undefined,
    set: {
      id: setId || "",
      name: (set?.name as string) || "",
      logo: set?.logo as string | undefined,
      symbol: set?.symbol as string | undefined,
    },
    number: localId,
    images: {
      // TCGDex provides image URLs with /low and /high suffixes
      small: cardImage ? `${cardImage}/low.webp` : `${imageBase}/low.webp`,
      large: cardImage ? `${cardImage}/high.webp` : `${imageBase}/high.webp`,
    },
  };
}

export interface SearchCardsResult {
  cards: Card[];
  error?: string;
}

export async function searchCards(
  filters: CardFilters
): Promise<SearchCardsResult> {
  try {
    // If we have a set filter, fetch cards from that set
    if (filters.setId) {
      const setData = await tcgdex.set.get(filters.setId);
      if (!setData || !setData.cards) {
        return { cards: [] };
      }

      // Get series ID for image URL construction
      const seriesId = (setData as unknown as { serie?: { id: string } }).serie
        ?.id;

      // Map and filter the cards
      let cards = setData.cards.map((c) =>
        mapCard({ ...c, set: { id: setData.id, name: setData.name } }, seriesId)
      );

      // Apply client-side filters
      cards = applyFilters(cards, filters);

      return { cards };
    }

    // Default: fetch from a popular recent set for demo
    // In production, you might want to implement pagination or search
    const sets = await tcgdex.set.list();
    if (!sets || sets.length === 0) {
      return { cards: [], error: "No sets available" };
    }

    // Get the most recent set
    const latestSet = sets[sets.length - 1];
    const setData = await tcgdex.set.get(latestSet.id);

    if (!setData || !setData.cards) {
      return { cards: [] };
    }

    // Get series ID for image URL construction
    const seriesId = (setData as unknown as { serie?: { id: string } }).serie
      ?.id;

    let cards = setData.cards.map((c) =>
      mapCard({ ...c, set: { id: setData.id, name: setData.name } }, seriesId)
    );

    cards = applyFilters(cards, filters);

    return { cards };
  } catch (error) {
    console.error("TCGDex search error:", error);
    return {
      cards: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function applyFilters(cards: Card[], filters: CardFilters): Card[] {
  let filtered = [...cards];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((card) =>
      card.name.toLowerCase().includes(searchLower)
    );
  }

  // Category filter
  if (filters.category !== "all") {
    filtered = filtered.filter((card) => card.category === filters.category);
  }

  // Regulation filter
  if (filters.regulation !== "all") {
    filtered = filtered.filter((card) => {
      const mark = card.regulationMark?.toUpperCase();
      switch (filters.regulation) {
        case "standard":
          return mark && ["F", "G", "H"].includes(mark);
        case "expanded":
          return mark && ["D", "E", "F", "G", "H"].includes(mark);
        case "other":
          return !mark || !["D", "E", "F", "G", "H"].includes(mark);
        default:
          return true;
      }
    });
  }

  // Rarity filter
  if (filters.rarities.length > 0) {
    filtered = filtered.filter((card) => {
      if (filters.rarities.includes("none")) {
        return !card.rarity || filters.rarities.includes(card.rarity);
      }
      return card.rarity && filters.rarities.includes(card.rarity);
    });
  }

  // Illustrator filter
  if (filters.illustrator) {
    const illustratorLower = filters.illustrator.toLowerCase();
    filtered = filtered.filter((card) =>
      card.illustrator?.toLowerCase().includes(illustratorLower)
    );
  }

  return filtered;
}

// Get available sets for the product filter
export async function getSets(): Promise<
  { id: string; name: string; logo?: string }[]
> {
  try {
    const sets = await tcgdex.set.list();
    return (sets || []).map((s) => ({
      id: s.id,
      name: s.name,
      logo: s.logo,
    }));
  } catch (error) {
    console.error("Failed to fetch sets:", error);
    return [];
  }
}

// Get a single card by ID
export async function getCard(cardId: string): Promise<Card | null> {
  try {
    const card = await tcgdex.card.get(cardId);
    if (!card) return null;
    return mapCard(card as unknown as Record<string, unknown>);
  } catch (error) {
    console.error("Failed to fetch card:", error);
    return null;
  }
}
