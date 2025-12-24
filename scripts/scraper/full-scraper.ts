#!/usr/bin/env tsx
/**
 * Full Pokemon TCG Asia Indonesia Scraper v2.0
 *
 * This script performs a complete scrape of the Indonesian Pokemon TCG website
 * by iterating through:
 * 1. All expansions (sets)
 * 2. All rarity filters for each expansion
 * 3. All pages within each rarity filter
 *
 * Supports all card types:
 * - Pokemon: Basic, Stage 1, Stage 2, V, VMAX, VSTAR, GX, EX, ex, etc.
 * - Trainer: Item, Supporter, Stadium, Pokemon Tool (Alat Pokemon)
 * - Energy: Basic Energy (Energi Dasar), Special Energy (Energi Spesial)
 *
 * Schema: Uses normalized tables (idn_card_attacks, idn_card_abilities, idn_card_search_text)
 *
 * Usage:
 *   pnpm full-scrape           # Scrape all sets with all rarities
 *   pnpm full-scrape:set MA2   # Scrape specific set
 *   pnpm full-scrape:test      # Scrape first set only (for testing)
 */

"use strict";

import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local explicitly (Next.js convention)
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import * as cheerio from "cheerio";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import pLimit from "p-limit";
import pRetry from "p-retry";

// --- Configuration ---
const BASE_URL = "https://asia.pokemon-card.com";
const DELAY_MS = 300; // Delay between requests
const CONCURRENCY = 3; // Concurrent detail page fetches

// Rarity mapping: display label -> internal filter value
const RARITY_MAP: Record<string, number> = {
  C: 1, // Common
  U: 2, // Uncommon
  R: 3, // Rare
  RR: 4, // Double Rare
  RRR: 5, // Triple Rare
  PR: 6, // Promo
  TR: 7, // Trainer Rare
  SR: 8, // Super Rare
  HR: 9, // Hyper Rare
  UR: 10, // Ultra Rare
  // 11 = Tanpa Tanda (No Mark) - skip, leave as null
  K: 12, // Kagayaku/Radiant
  A: 13, // Amazing Rare
  AR: 14, // Art Rare
  SAR: 15, // Special Art Rare
  S: 16, // Shiny
  SSR: 17, // Shiny Super Rare
  ACE: 18, // ACE SPEC
  BWR: 19, // BWR
  MUR: 20, // MUR
};

// Trainer subtypes (Indonesian -> Normalized)
const TRAINER_SUBTYPES: Record<string, string> = {
  item: "Item",
  supporter: "Supporter",
  stadium: "Stadium",
  "pokémon tool": "Pokemon Tool",
  "pokemon tool": "Pokemon Tool",
  "alat pokémon": "Pokemon Tool",
  "alat pokemon": "Pokemon Tool",
  tool: "Pokemon Tool",
};

// Energy subtypes (Indonesian -> Normalized)
const ENERGY_SUBTYPES: Record<string, string> = {
  "energi dasar": "Basic",
  "basic energy": "Basic",
  "energi spesial": "Special",
  "special energy": "Special",
  "energi khusus": "Special",
};

// Pokemon stage patterns (for V-series, GX, EX, etc.)
const POKEMON_STAGE_PATTERNS: { pattern: RegExp; stage: string }[] = [
  { pattern: /\bVSTAR\b/i, stage: "VSTAR" },
  { pattern: /\bVMAX\b/i, stage: "VMAX" },
  { pattern: /\bV\b(?!MAX|STAR)/i, stage: "V" },
  { pattern: /\bGX\b/i, stage: "GX" },
  { pattern: /\bEX\b/i, stage: "EX" }, // Old EX (uppercase)
  { pattern: /\bex\b/, stage: "ex" }, // New ex (lowercase, Scarlet/Violet)
  { pattern: /\bBreak\b/i, stage: "BREAK" },
  { pattern: /\bPRISM\b/i, stage: "Prism Star" },
  { pattern: /\bRadiant\b/i, stage: "Radiant" },
  { pattern: /\bKagayaku\b/i, stage: "Radiant" },
];

// --- Types ---
interface Expansion {
  code: string;
  name: string;
}

interface CardListResult {
  cardIds: string[]; // Numeric internal IDs
  totalPages: number;
  totalCards: number;
}

interface ScrapedCard {
  id: string;
  localId: string;
  name: string;
  category: "Pokemon" | "Trainer" | "Energy";
  subtype: string | null; // Trainer: Item/Supporter/Stadium/Pokemon Tool, Energy: Basic/Special
  setId: string | null;
  setName: string | null;
  hp: number | null;
  types: string[];
  regulationMark: string | null;
  rarity: string | null;
  stage: string | null; // Pokemon only: Basic, Stage 1, Stage 2, V, VMAX, VSTAR, GX, ex, etc.
  illustrator: string | null;
  imageUrl: string;
  attacks: ScrapedAttack[];
  abilities: ScrapedAbility[];
  effectText: string | null; // Main effect for Trainer/Energy cards
  weakness: { type: string; value: string } | null;
  resistance: { type: string; value: string } | null;
  retreatCost: number | null;
  pokedexNumber: number | null; // Pokemon national dex number
  flavorText: string | null;
}

interface ScrapedAttack {
  name: string;
  cost: string[];
  damage: string | null;
  effect: string | null;
}

interface ScrapedAbility {
  name: string;
  type: string;
  effect: string;
}

interface ScrapeProgress {
  totalExpansions: number;
  currentExpansion: number;
  totalCards: number;
  cardsUpdated: number;
  errors: string[];
}

// --- Supabase client ---
let supabase: SupabaseClient;

function initDatabase(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    console.error("ERROR: Missing Supabase credentials");
    console.error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local"
    );
    process.exit(1);
  }

  supabase = createClient(url, secretKey);
}

// --- HTTP Fetcher ---
async function fetchWithRetry(url: string): Promise<string> {
  const response = await pRetry(
    async () => {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.text();
    },
    {
      retries: 3,
      minTimeout: 1000,
      onFailedAttempt: (error) => {
        console.log(
          `  Attempt ${error.attemptNumber} failed. Retrying... (${error.retriesLeft} left)`
        );
      },
    }
  );
  return response;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Parsers ---

/**
 * Parse the main expansion list page to get all expansion codes and names
 */
function parseExpansionList(html: string): Expansion[] {
  const $ = cheerio.load(html);
  const expansions: Expansion[] = [];

  // Find all expansion links: /id/card-search/list/?expansionCodes=XXX
  $('a[href*="/id/card-search/list/?expansionCodes="]').each((_, el) => {
    const href = $(el).attr("href") || "";
    const match = href.match(/expansionCodes=([A-Z0-9-]+)/i);
    if (match) {
      const code = match[1];
      // Get the expansion name from the link text or nearby elements
      const name = $(el).text().replace(/\s+/g, " ").trim();

      // Avoid duplicates
      if (!expansions.find((e) => e.code === code)) {
        expansions.push({ code, name });
      }
    }
  });

  return expansions;
}

/**
 * Parse card list page and extract numeric card IDs
 * Cards link to: /id/card-search/detail/{NUMERIC_ID}/
 */
function parseCardListPage(html: string): CardListResult {
  const $ = cheerio.load(html);
  const cardIds: string[] = [];

  // Extract numeric card IDs from detail links
  $('a[href*="/id/card-search/detail/"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    // Match numeric IDs: /id/card-search/detail/12345/
    const match = href.match(/\/detail\/(\d+)\/?$/);
    if (match) {
      const id = match[1];
      if (!cardIds.includes(id)) {
        cardIds.push(id);
      }
    }
  });

  // Extract pagination info
  let totalCards = 0;
  let totalPages = 1;

  const bodyText = $("body").text();

  // Match "XX buah" (XX items)
  const countMatch = bodyText.match(/(\d+)\s*buah/);
  if (countMatch) {
    totalCards = parseInt(countMatch[1], 10);
  }

  // Match "Halaman X / Total Y halaman"
  const pagesMatch = bodyText.match(
    /Halaman\s*\d+\s*\/\s*Total\s*(\d+)\s*halaman/i
  );
  if (pagesMatch) {
    totalPages = parseInt(pagesMatch[1], 10);
  } else {
    // Fallback: check for pageNo links
    const lastPageLink = $("a[href*='pageNo=']").last();
    if (lastPageLink.length) {
      const href = lastPageLink.attr("href");
      const pageMatch = href?.match(/pageNo=(\d+)/);
      if (pageMatch) {
        totalPages = parseInt(pageMatch[1], 10);
      }
    }
  }

  return { cardIds, totalPages, totalCards };
}

/**
 * Detect Pokemon stage from H1 text and evolveMarker
 */
function detectPokemonStage(
  h1Text: string,
  evolveMarker: string
): string | null {
  const lowerMarker = evolveMarker.toLowerCase().trim();
  const lowerH1 = h1Text.toLowerCase();

  // Check evolveMarker first (most reliable for Basic/Stage 1/Stage 2)
  if (lowerMarker === "basic" || lowerMarker === "dasar") return "Basic";
  if (lowerMarker === "stage 1" || lowerMarker === "tahap 1") return "Stage 1";
  if (lowerMarker === "stage 2" || lowerMarker === "tahap 2") return "Stage 2";

  // Check for V-series, GX, EX, ex patterns in H1 or evolveMarker
  const textToCheck = `${h1Text} ${evolveMarker}`;
  for (const { pattern, stage } of POKEMON_STAGE_PATTERNS) {
    if (pattern.test(textToCheck)) {
      return stage;
    }
  }

  // Check for "lainnya" prefix (indicates special Pokemon like VMAX, VSTAR)
  if (lowerH1.startsWith("lainnya ")) {
    // Already covered by patterns above, but if nothing matched, mark as special
    return "Other";
  }

  return null;
}

/**
 * Detect Trainer subtype from H3 heading text
 */
function detectTrainerSubtype(subtypeText: string): string | null {
  const lower = subtypeText.toLowerCase().trim();
  return TRAINER_SUBTYPES[lower] || null;
}

/**
 * Detect Energy subtype from H3 heading text
 */
function detectEnergySubtype(subtypeText: string): string | null {
  const lower = subtypeText.toLowerCase().trim();
  return ENERGY_SUBTYPES[lower] || null;
}

/**
 * Parse card detail page - complete card data extraction
 * Handles Pokemon, Trainer, and Energy cards comprehensively
 */
function parseCardDetailPage(html: string, cardId: string): ScrapedCard | null {
  const $ = cheerio.load(html);

  try {
    // Card name from h1
    const h1El = $("h1").first();
    const titleText = h1El.text().trim();

    // Extract evolveMarker if present
    const evolveMarker = h1El.find(".evolveMarker").text().toLowerCase().trim();

    // Extract name (without stage prefix)
    let name = titleText;
    const h1Clone = h1El.clone();
    h1Clone.find(".evolveMarker").remove();
    const nameOnly = h1Clone.text().trim();
    if (nameOnly) {
      // Remove "lainnya " prefix if present (used for V/VMAX/VSTAR/GX cards)
      name = nameOnly
        .replace(/^lainnya\s+/i, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    // Initialize card data
    let category: "Pokemon" | "Trainer" | "Energy" = "Pokemon";
    let subtype: string | null = null;
    let stage: string | null = null;
    let effectText: string | null = null;

    // Look for H3 headings to determine card type and extract effect text
    const h3Elements = $("h3");
    let foundCardType = false;

    h3Elements.each((_, h3El) => {
      if (foundCardType) return; // Already found, skip

      const h3Text = $(h3El).text().trim();
      const h3Lower = h3Text.toLowerCase();

      // Check for Trainer subtypes
      const trainerSubtype = detectTrainerSubtype(h3Text);
      if (trainerSubtype) {
        category = "Trainer";
        subtype = trainerSubtype;
        foundCardType = true;

        // Effect text is the content after this H3, before the next H3 or section
        // It's typically the next sibling text or paragraph
        const parent = $(h3El).parent();
        let effectContent = "";

        // Get all text between this H3 and the next structural element
        const siblings = $(h3El).nextUntil("h3, .illustrator, table");
        siblings.each((_, sib) => {
          const text = $(sib).text().trim();
          if (text && !text.match(/^[A-Z]\s+\d{3}\/\d+/)) {
            // Skip collector numbers
            effectContent += " " + text;
          }
        });

        // Also check immediate text content
        if (!effectContent.trim()) {
          // Get text directly after H3 in the same container
          const nextText = $(h3El).next().text().trim();
          if (nextText && !nextText.match(/^[A-Z]\s+\d{3}\/\d+/)) {
            effectContent = nextText;
          }
        }

        effectText = effectContent.trim() || null;
        return;
      }

      // Check for Energy subtypes
      const energySubtype = detectEnergySubtype(h3Text);
      if (energySubtype) {
        category = "Energy";
        subtype = energySubtype;
        foundCardType = true;

        // Special Energy has effect text, Basic Energy does not
        if (energySubtype === "Special") {
          const siblings = $(h3El).nextUntil("h3, .illustrator, table");
          let effectContent = "";
          siblings.each((_, sib) => {
            const text = $(sib).text().trim();
            if (text && !text.match(/^[A-Z]\s+\d{3}\/\d+/)) {
              effectContent += " " + text;
            }
          });
          effectText = effectContent.trim() || null;
        }
        return;
      }

      // Check for "Serangan" (Attacks) - indicates Pokemon card
      if (h3Lower === "serangan" || h3Lower === "attacks") {
        category = "Pokemon";
        foundCardType = true;
      }
    });

    // If still Pokemon, detect stage
    if (category === "Pokemon") {
      stage = detectPokemonStage(titleText, evolveMarker);
    }

    // --- Pokemon-specific data ---
    let hp: number | null = null;
    const types: string[] = [];
    const attacks: ScrapedAttack[] = [];
    const abilities: ScrapedAbility[] = [];
    let weakness: { type: string; value: string } | null = null;
    let resistance: { type: string; value: string } | null = null;
    let retreatCost: number | null = null;
    let pokedexNumber: number | null = null;
    let flavorText: string | null = null;

    if (category === "Pokemon") {
      // HP from .mainInfomation
      const hpSpan = $(".mainInfomation .number, .hp .number").first();
      if (hpSpan.length) {
        const hpVal = parseInt(hpSpan.text().trim(), 10);
        if (!isNaN(hpVal)) hp = hpVal;
      }

      // Types from mainInfomation
      $(".mainInfomation, .cardInfomation")
        .find('img[src*="/energy/"]')
        .each((_, el) => {
          const src = $(el).attr("src") || "";
          const match = src.match(/\/energy\/(\w+)\.png/i);
          if (match && !types.includes(match[1])) {
            types.push(match[1]);
          }
        });

      // Attacks from .skillInformation
      $(".skillInformation .skill, .skill").each((_, skillEl) => {
        const $skill = $(skillEl);
        const attackName = $skill.find(".skillName").text().trim();
        if (!attackName) return;

        const cost: string[] = [];
        $skill.find('.skillCost img[src*="/energy/"]').each((_, img) => {
          const src = $(img).attr("src") || "";
          const match = src.match(/\/energy\/(\w+)\.png/i);
          if (match) cost.push(match[1]);
        });

        const damage = $skill.find(".skillDamage").text().trim() || null;
        const effect = $skill.find(".skillEffect").text().trim() || null;

        attacks.push({ name: attackName, cost, damage, effect });
      });

      // Abilities from .talentInformation
      $(".talentInformation .talent, .ability").each((_, el) => {
        const $ability = $(el);
        const abilityName = $ability
          .find(".talentName, .abilityName")
          .text()
          .trim();
        const type =
          $ability.find(".talentType, .abilityType").text().trim() || "Ability";
        const effect = $ability
          .find(".talentEffect, .abilityEffect, p")
          .text()
          .trim();

        if (abilityName) {
          abilities.push({ name: abilityName, type, effect });
        }
      });

      // Stats (weakness, resistance, retreat)
      const statsTable = $("table").filter((_, el) => {
        return $(el).text().includes("Kelemahan");
      });

      if (statsTable.length) {
        // Weakness
        const weaknessCell = statsTable
          .find(".weakpoint, td:contains('Kelemahan')")
          .first();
        if (weaknessCell.length) {
          const weaknessRow = weaknessCell.closest("tr").length
            ? weaknessCell.closest("tr")
            : weaknessCell.parent();
          const weakImg = weaknessRow.find('img[src*="/energy/"]').first();
          const weakType = weakImg
            .attr("src")
            ?.match(/\/energy\/(\w+)\.png/i)?.[1];
          const weakValue = weaknessRow.text().match(/×(\d+)/)?.[0] || "×2";
          if (weakType) {
            weakness = { type: weakType, value: weakValue };
          }
        }

        // Resistance
        const resistCell = statsTable
          .find(".resist, td:contains('Resistansi')")
          .first();
        if (resistCell.length) {
          const resistRow = resistCell.closest("tr").length
            ? resistCell.closest("tr")
            : resistCell.parent();
          const resistImg = resistRow.find('img[src*="/energy/"]').first();
          const resistType = resistImg
            .attr("src")
            ?.match(/\/energy\/(\w+)\.png/i)?.[1];
          const resistValue = resistRow.text().match(/(-\d+)/)?.[0];
          if (resistType && resistValue) {
            resistance = { type: resistType, value: resistValue };
          }
        }

        // Retreat cost
        const escapeCells = statsTable.find(".escape");
        escapeCells.each((_, cell) => {
          const $cell = $(cell);
          const icons = $cell.find('img[src*="/energy/"]');
          if (icons.length > 0) {
            retreatCost = icons.length;
            return false;
          }
        });
      }

      // Pokedex number (from "No.XXX" pattern)
      const extraInfo = $(".extraInformation h3").text();
      const pokeMatch = extraInfo.match(/No\.(\d+)/);
      if (pokeMatch) {
        pokedexNumber = parseInt(pokeMatch[1], 10);
      }

      // Flavor text
      const flavorEl = $(".discription, .description, .flavorText").first();
      flavorText = flavorEl.length
        ? flavorEl.text().trim().slice(0, 500)
        : null;
    }

    // --- Common fields ---

    // Regulation mark and local ID
    const regMark = $(".expansionColumn .alpha").text().trim() || null;
    const collectorNum = $(".collectorNumber").text().trim();
    const numMatch = collectorNum.match(/^(\d+)/);
    const localId = numMatch ? numMatch[1] : cardId;

    // Illustrator
    const illustratorLink = $('a[href*="illustratorName"]');
    const illustrator = illustratorLink.length
      ? illustratorLink.text().trim()
      : null;

    // Set info
    const productLink = $('a[href*="expansionCodes"]');
    let setId: string | null = null;
    let setName: string | null = null;
    if (productLink.length) {
      const href = productLink.attr("href") || "";
      const match = href.match(/expansionCodes=([A-Z0-9-]+)/i);
      setId = match ? match[1] : null;
      setName = productLink.text().trim() || null;
    }

    // Image URL
    const paddedId = cardId.padStart(8, "0");
    const imageUrl = `https://asia.pokemon-card.com/id/card-img/id${paddedId}.png`;

    return {
      id: cardId,
      localId,
      name,
      category,
      subtype,
      setId,
      setName,
      hp,
      types: types.slice(0, 2),
      regulationMark: regMark,
      rarity: null, // Will be set later based on filter
      stage,
      illustrator,
      imageUrl,
      attacks,
      abilities,
      effectText,
      weakness,
      resistance,
      retreatCost,
      pokedexNumber,
      flavorText,
    };
  } catch (error) {
    console.error(`Error parsing card ${cardId}:`, error);
    return null;
  }
}

// --- Database Operations ---

async function upsertSet(setId: string, setName: string): Promise<void> {
  const { error } = await supabase.from("idn_sets").upsert(
    {
      id: setId,
      name: setName,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error(`Failed to upsert set ${setId}:`, error.message);
  }
}

/**
 * Upsert card with all related data (attacks, abilities, search text)
 */
async function upsertCardWithRarity(
  card: ScrapedCard,
  rarity: string | null
): Promise<boolean> {
  // Ensure set exists
  if (card.setId && card.setName) {
    await upsertSet(card.setId, card.setName);
  }

  // 1. Upsert main card record (without JSONB columns - using normalized tables instead)
  const { error: cardError } = await supabase.from("idn_cards").upsert(
    {
      id: card.id,
      set_id: card.setId,
      local_id: card.localId,
      name: card.name,
      category: card.category,
      subtype: card.subtype,
      hp: card.hp,
      types: card.types.length > 0 ? card.types : null,
      regulation_mark: card.regulationMark,
      rarity: rarity,
      stage: card.stage,
      illustrator: card.illustrator,
      image_url: card.imageUrl,
      effect_text: card.effectText,
      weakness: card.weakness,
      resistance: card.resistance,
      retreat_cost: card.retreatCost,
      pokedex_number: card.pokedexNumber,
      flavor_text: card.flavorText,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (cardError) {
    console.error(`Failed to upsert card ${card.id}:`, cardError.message);
    return false;
  }

  // 2. Delete and re-insert attacks (normalized table)
  if (card.attacks.length > 0) {
    await supabase.from("idn_card_attacks").delete().eq("card_id", card.id);

    const attackRows = card.attacks.map((attack, idx) => ({
      card_id: card.id,
      name: attack.name,
      cost: attack.cost,
      damage: attack.damage,
      effect: attack.effect,
      position: idx,
    }));

    const { error: attackError } = await supabase
      .from("idn_card_attacks")
      .insert(attackRows);

    if (attackError) {
      console.error(
        `Failed to insert attacks for ${card.id}:`,
        attackError.message
      );
    }
  }

  // 3. Delete and re-insert abilities (normalized table)
  if (card.abilities.length > 0) {
    await supabase.from("idn_card_abilities").delete().eq("card_id", card.id);

    const abilityRows = card.abilities.map((ability, idx) => ({
      card_id: card.id,
      name: ability.name,
      type: ability.type,
      effect: ability.effect,
      position: idx,
    }));

    const { error: abilityError } = await supabase
      .from("idn_card_abilities")
      .insert(abilityRows);

    if (abilityError) {
      console.error(
        `Failed to insert abilities for ${card.id}:`,
        abilityError.message
      );
    }
  }

  // 4. Update search text (triggers should handle this, but we ensure it exists)
  const searchText = buildSearchText(card);
  const { error: searchError } = await supabase
    .from("idn_card_search_text")
    .upsert(
      {
        card_id: card.id,
        search_text: searchText,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "card_id" }
    );

  if (searchError) {
    console.error(
      `Failed to upsert search text for ${card.id}:`,
      searchError.message
    );
  }

  return true;
}

/**
 * Build search text from card data
 */
function buildSearchText(card: ScrapedCard): string {
  const parts: string[] = [card.name];

  if (card.effectText) {
    parts.push(card.effectText);
  }

  for (const attack of card.attacks) {
    parts.push(attack.name);
    if (attack.effect) {
      parts.push(attack.effect);
    }
  }

  for (const ability of card.abilities) {
    parts.push(ability.name);
    if (ability.effect) {
      parts.push(ability.effect);
    }
  }

  return parts.join(" ").toLowerCase();
}

async function updateCardRarityOnly(
  cardId: string,
  rarity: string
): Promise<boolean> {
  const { error } = await supabase
    .from("idn_cards")
    .update({ rarity, updated_at: new Date().toISOString() })
    .eq("id", cardId);

  if (error) {
    console.error(`Failed to update rarity for ${cardId}:`, error.message);
    return false;
  }

  return true;
}

async function getCardCount(): Promise<number> {
  const { count, error } = await supabase
    .from("idn_cards")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Failed to get card count:", error.message);
    return 0;
  }

  return count || 0;
}

// --- Main Scraper Functions ---

/**
 * Fetch all card IDs for a specific expansion + rarity combination
 */
async function fetchCardIdsForExpansionRarity(
  expansionCode: string,
  rarityValue: number
): Promise<string[]> {
  const allCardIds: string[] = [];

  // Build URL with rarity filter
  const baseUrl = `${BASE_URL}/id/card-search/list/?expansionCodes=${expansionCode}&rarity[0]=${rarityValue}`;

  try {
    // Fetch first page
    const firstPageHtml = await fetchWithRetry(baseUrl);
    const { cardIds, totalPages } = parseCardListPage(firstPageHtml);
    allCardIds.push(...cardIds);

    // Fetch remaining pages if any
    for (let page = 2; page <= totalPages; page++) {
      await delay(DELAY_MS);
      const pageUrl = `${BASE_URL}/id/card-search/list/?pageNo=${page}&expansionCodes=${expansionCode}&rarity[0]=${rarityValue}`;
      const pageHtml = await fetchWithRetry(pageUrl);
      const { cardIds: pageCardIds } = parseCardListPage(pageHtml);
      allCardIds.push(...pageCardIds);
    }
  } catch (error) {
    console.error(
      `  Error fetching cards for ${expansionCode} rarity ${rarityValue}:`,
      (error as Error).message
    );
  }

  return [...new Set(allCardIds)]; // Dedupe
}

/**
 * Fetch all card IDs for an expansion (without rarity filter)
 */
async function fetchAllCardIdsForExpansion(
  expansionCode: string
): Promise<string[]> {
  const allCardIds: string[] = [];

  // Build URL without rarity filter
  const baseUrl = `${BASE_URL}/id/card-search/list/?expansionCodes=${expansionCode}`;

  try {
    // Fetch first page
    const firstPageHtml = await fetchWithRetry(baseUrl);
    const { cardIds, totalPages, totalCards } =
      parseCardListPage(firstPageHtml);
    allCardIds.push(...cardIds);

    console.log(`  Found ${totalCards} cards across ${totalPages} pages`);

    // Fetch remaining pages
    for (let page = 2; page <= totalPages; page++) {
      await delay(DELAY_MS);
      process.stdout.write(`    Page ${page}/${totalPages}...`);
      const pageUrl = `${BASE_URL}/id/card-search/list/?pageNo=${page}&expansionCodes=${expansionCode}`;
      const pageHtml = await fetchWithRetry(pageUrl);
      const { cardIds: pageCardIds } = parseCardListPage(pageHtml);
      allCardIds.push(...pageCardIds);
      console.log(` ${pageCardIds.length} cards`);
    }
  } catch (error) {
    console.error(
      `  Error fetching cards for ${expansionCode}:`,
      (error as Error).message
    );
  }

  return [...new Set(allCardIds)];
}

/**
 * Process a single expansion: fetch all cards and their details with rarity
 */
async function processExpansion(
  expansion: Expansion,
  progress: ScrapeProgress,
  options: { rarityOnly?: boolean; fullScrape?: boolean }
): Promise<void> {
  console.log(`\n${"=".repeat(70)}`);
  console.log(
    `📦 Processing: ${expansion.name} (${expansion.code}) [${progress.currentExpansion}/${progress.totalExpansions}]`
  );
  console.log("=".repeat(70));

  const limit = pLimit(CONCURRENCY);

  if (options.rarityOnly) {
    // Just update rarity for existing cards
    console.log("  Mode: Rarity Update Only");

    for (const [rarityLabel, rarityValue] of Object.entries(RARITY_MAP)) {
      process.stdout.write(`  ${rarityLabel.padEnd(4)}: `);

      const cardIds = await fetchCardIdsForExpansionRarity(
        expansion.code,
        rarityValue
      );

      if (cardIds.length === 0) {
        console.log("0 cards");
        await delay(DELAY_MS);
        continue;
      }

      console.log(`${cardIds.length} cards`);

      // Update rarity for each card
      let updated = 0;
      for (const cardId of cardIds) {
        const success = await updateCardRarityOnly(cardId, rarityLabel);
        if (success) updated++;
      }

      progress.cardsUpdated += updated;
      console.log(`       └─ Updated: ${updated}/${cardIds.length}`);

      await delay(DELAY_MS);
    }
  } else {
    // Full scrape: fetch card details and set rarity
    console.log("  Mode: Full Scrape");

    for (const [rarityLabel, rarityValue] of Object.entries(RARITY_MAP)) {
      process.stdout.write(`  ${rarityLabel.padEnd(4)}: `);

      const cardIds = await fetchCardIdsForExpansionRarity(
        expansion.code,
        rarityValue
      );

      if (cardIds.length === 0) {
        console.log("0 cards");
        await delay(DELAY_MS);
        continue;
      }

      console.log(`${cardIds.length} cards found`);

      // Fetch and upsert each card with rarity
      const cardPromises = cardIds.map((cardId) =>
        limit(async () => {
          try {
            await delay(100); // Small delay between detail fetches
            const detailUrl = `${BASE_URL}/id/card-search/detail/${cardId}/`;
            const detailHtml = await fetchWithRetry(detailUrl);
            const card = parseCardDetailPage(detailHtml, cardId);

            if (card) {
              const success = await upsertCardWithRarity(card, rarityLabel);
              if (success) {
                progress.cardsUpdated++;
                progress.totalCards++;
              }
              return success;
            }
          } catch (error) {
            progress.errors.push(`Card ${cardId}: ${(error as Error).message}`);
          }
          return false;
        })
      );

      const results = await Promise.all(cardPromises);
      const successCount = results.filter(Boolean).length;

      console.log(`       └─ Scraped: ${successCount}/${cardIds.length}`);

      await delay(DELAY_MS);
    }

    // Also fetch cards without rarity (Tanpa Tanda = value 11)
    process.stdout.write("  NONE: ");
    const noRarityCardIds = await fetchCardIdsForExpansionRarity(
      expansion.code,
      11
    );

    if (noRarityCardIds.length > 0) {
      console.log(`${noRarityCardIds.length} cards (unmarked)`);

      const promises = noRarityCardIds.map((cardId) =>
        limit(async () => {
          try {
            await delay(100);
            const detailUrl = `${BASE_URL}/id/card-search/detail/${cardId}/`;
            const detailHtml = await fetchWithRetry(detailUrl);
            const card = parseCardDetailPage(detailHtml, cardId);

            if (card) {
              // Leave rarity as null for unmarked cards
              const success = await upsertCardWithRarity(card, null);
              if (success) {
                progress.cardsUpdated++;
                progress.totalCards++;
              }
              return success;
            }
          } catch (error) {
            progress.errors.push(`Card ${cardId}: ${(error as Error).message}`);
          }
          return false;
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(Boolean).length;
      console.log(
        `       └─ Scraped: ${successCount}/${noRarityCardIds.length}`
      );
    } else {
      console.log("0 cards");
    }
  }
}

/**
 * Fetch all expansions from the main search page
 */
async function fetchAllExpansions(): Promise<Expansion[]> {
  console.log("\n📋 Fetching expansion list...");

  // Fetch the main card search page
  const html = await fetchWithRetry(`${BASE_URL}/id/card-search/`);
  const $ = cheerio.load(html);

  const expansions: Expansion[] = [];
  const seen = new Set<string>();

  // Find expansion list - look for expansion links
  $("ul.expansionArea a, .expansionArea a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const match = href.match(/expansionCodes=([A-Z0-9-]+)/i);
    if (match) {
      const code = match[1];
      if (!seen.has(code)) {
        seen.add(code);
        // Get expansion name from the element text or data attribute
        const name =
          $(el).find("span").first().text().trim() ||
          $(el).attr("data-name") ||
          $(el).text().replace(/\s+/g, " ").trim() ||
          code;
        expansions.push({ code, name });
      }
    }
  });

  // Fallback: look for any expansion links
  if (expansions.length === 0) {
    $('a[href*="expansionCodes="]').each((_, el) => {
      const href = $(el).attr("href") || "";
      const match = href.match(/expansionCodes=([A-Z0-9-]+)/i);
      if (match) {
        const code = match[1];
        if (!seen.has(code)) {
          seen.add(code);
          const name = $(el).text().replace(/\s+/g, " ").trim() || code;
          expansions.push({ code, name });
        }
      }
    });
  }

  console.log(`  Found ${expansions.length} expansions`);
  return expansions;
}

// --- Main Entry Point ---
async function main(): Promise<void> {
  console.log("\n🎴 Pokemon TCG Indonesia Full Scraper v2.0");
  console.log("=".repeat(50));

  // Parse command line arguments
  const args = process.argv.slice(2);
  const testMode = args.includes("--test");
  const rarityOnly = args.includes("--rarity-only");
  const specificSet = args.find(
    (a) => !a.startsWith("--") && a.toUpperCase() === a
  );

  // Initialize database
  initDatabase();

  // Get initial card count
  const initialCount = await getCardCount();
  console.log(`📊 Current cards in database: ${initialCount}`);

  // Fetch all expansions
  let expansions = await fetchAllExpansions();

  if (expansions.length === 0) {
    console.error("❌ No expansions found. Exiting.");
    process.exit(1);
  }

  // Filter expansions based on arguments
  if (specificSet) {
    expansions = expansions.filter((e) => e.code === specificSet);
    if (expansions.length === 0) {
      console.error(`❌ Expansion "${specificSet}" not found.`);
      process.exit(1);
    }
    console.log(`🎯 Targeting specific set: ${specificSet}`);
  } else if (testMode) {
    expansions = expansions.slice(0, 1);
    console.log(`🧪 Test mode: processing only first expansion`);
  }

  // Initialize progress
  const progress: ScrapeProgress = {
    totalExpansions: expansions.length,
    currentExpansion: 0,
    totalCards: 0,
    cardsUpdated: 0,
    errors: [],
  };

  // Process each expansion
  for (const expansion of expansions) {
    progress.currentExpansion++;
    await processExpansion(expansion, progress, { rarityOnly });
  }

  // Final summary
  console.log("\n" + "=".repeat(70));
  console.log("📊 SCRAPING COMPLETE");
  console.log("=".repeat(70));
  console.log(`  Expansions processed: ${progress.totalExpansions}`);
  console.log(`  Cards updated: ${progress.cardsUpdated}`);
  console.log(`  Errors: ${progress.errors.length}`);

  if (progress.errors.length > 0) {
    console.log("\n⚠️ Errors:");
    progress.errors.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
    if (progress.errors.length > 10) {
      console.log(`  ... and ${progress.errors.length - 10} more`);
    }
  }

  const finalCount = await getCardCount();
  console.log(`\n📊 Final cards in database: ${finalCount}`);
  console.log(`  New cards added: ${finalCount - initialCount}`);
}

// Run
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
