#!/usr/bin/env tsx
/**
 * Full Pokemon TCG Asia Indonesia Scraper
 *
 * This script performs a complete scrape of the Indonesian Pokemon TCG website
 * by iterating through:
 * 1. All expansions (sets)
 * 2. All rarity filters for each expansion
 * 3. All pages within each rarity filter
 *
 * This ensures complete coverage and correctly populates the rarity field.
 *
 * URL Structure:
 * - Expansion list: https://asia.pokemon-card.com/id/card-search/
 * - Cards by expansion: https://asia.pokemon-card.com/id/card-search/list/?expansionCodes={SET}
 * - Cards by rarity: https://asia.pokemon-card.com/id/card-search/list/?expansionCodes={SET}&rarity[0]={RARITY_VALUE}
 * - Paginated: https://asia.pokemon-card.com/id/card-search/list/?pageNo={PAGE}&expansionCodes={SET}&rarity[0]={RARITY_VALUE}
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
  setId: string | null;
  setName: string | null;
  hp: number | null;
  types: string[];
  regulationMark: string | null;
  rarity: string | null;
  stage: string | null;
  illustrator: string | null;
  imageUrl: string;
  attacks: ScrapedAttack[];
  abilities: ScrapedAbility[];
  weakness: { type: string; value: string } | null;
  resistance: { type: string; value: string } | null;
  retreatCost: number | null;
  pokedexNumber: number | null;
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
 * Parse card detail page - complete card data extraction
 */
function parseCardDetailPage(html: string, cardId: string): ScrapedCard | null {
  const $ = cheerio.load(html);

  try {
    // Card name from h1
    const h1El = $("h1").first();
    const titleText = h1El.text().trim();

    // Extract stage from evolveMarker or title
    let stage: string | null = null;
    const evolveMarker = h1El.find(".evolveMarker").text().toLowerCase().trim();
    if (evolveMarker) {
      if (evolveMarker === "basic") stage = "Basic";
      else if (evolveMarker === "stage 1" || evolveMarker === "tahap 1")
        stage = "Stage 1";
      else if (evolveMarker === "stage 2" || evolveMarker === "tahap 2")
        stage = "Stage 2";
      else if (evolveMarker.includes("item")) stage = "Item";
      else if (evolveMarker.includes("supporter")) stage = "Supporter";
      else if (evolveMarker.includes("stadium")) stage = "Stadium";
      else if (evolveMarker.includes("tool")) stage = "Tool";
    }

    // Extract name (without stage prefix)
    let name = titleText;
    const h1Clone = h1El.clone();
    h1Clone.find(".evolveMarker").remove();
    const nameOnly = h1Clone.text().trim();
    if (nameOnly) {
      name = nameOnly.replace(/\s+/g, " ").trim();
    }

    // HP from .mainInfomation
    let hp: number | null = null;
    const hpSpan = $(".mainInfomation .number, .hp .number").first();
    if (hpSpan.length) {
      const hpVal = parseInt(hpSpan.text().trim(), 10);
      if (!isNaN(hpVal)) hp = hpVal;
    }

    // Regulation mark and local ID
    const regMark = $(".expansionColumn .alpha").text().trim() || null;
    const collectorNum = $(".collectorNumber").text().trim();
    const numMatch = collectorNum.match(/^(\d+)/);
    const localId = numMatch ? numMatch[1] : cardId;

    // Category detection
    let category: "Pokemon" | "Trainer" | "Energy" = "Pokemon";
    if (
      evolveMarker.includes("item") ||
      evolveMarker.includes("supporter") ||
      evolveMarker.includes("stadium") ||
      evolveMarker.includes("tool") ||
      evolveMarker.includes("trainer")
    ) {
      category = "Trainer";
    } else if (
      evolveMarker.includes("energy") ||
      evolveMarker.includes("energi") ||
      titleText.toLowerCase().includes("energy") ||
      titleText.toLowerCase().includes("energi")
    ) {
      category = "Energy";
    }

    // Types from mainInfomation
    const types: string[] = [];
    $(".mainInfomation, .cardInfomation")
      .find('img[src*="/energy/"]')
      .each((_, el) => {
        const src = $(el).attr("src") || "";
        const match = src.match(/\/energy\/(\w+)\.png/i);
        if (match && !types.includes(match[1])) {
          types.push(match[1]);
        }
      });

    // Attacks
    const attacks: ScrapedAttack[] = [];
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

    // Abilities
    const abilities: ScrapedAbility[] = [];
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
    let weakness: { type: string; value: string } | null = null;
    let resistance: { type: string; value: string } | null = null;
    let retreatCost: number | null = null;

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

    // Pokedex number
    let pokedexNumber: number | null = null;
    const extraInfo = $(".extraInformation h3").text();
    const pokeMatch = extraInfo.match(/No\.(\d+)/);
    if (pokeMatch) {
      pokedexNumber = parseInt(pokeMatch[1], 10);
    }

    // Flavor text
    const flavorEl = $(".discription, .description, .flavorText").first();
    const flavorText = flavorEl.length
      ? flavorEl.text().trim().slice(0, 500)
      : null;

    // Image URL
    const paddedId = cardId.padStart(8, "0");
    const imageUrl = `https://asia.pokemon-card.com/id/card-img/id${paddedId}.png`;

    return {
      id: cardId,
      localId,
      name,
      category,
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

async function upsertCardWithRarity(
  card: ScrapedCard,
  rarity: string | null
): Promise<boolean> {
  // Ensure set exists
  if (card.setId && card.setName) {
    await upsertSet(card.setId, card.setName);
  }

  const { error } = await supabase.from("idn_cards").upsert(
    {
      id: card.id,
      set_id: card.setId,
      local_id: card.localId,
      name: card.name,
      category: card.category,
      hp: card.hp,
      types: card.types.length > 0 ? card.types : null,
      regulation_mark: card.regulationMark,
      rarity: rarity, // Use the rarity from filter
      stage: card.stage,
      illustrator: card.illustrator,
      image_url: card.imageUrl,
      attacks: card.attacks.length > 0 ? card.attacks : null,
      abilities: card.abilities.length > 0 ? card.abilities : null,
      weakness: card.weakness,
      resistance: card.resistance,
      retreat_cost: card.retreatCost,
      pokedex_number: card.pokedexNumber,
      flavor_text: card.flavorText,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error(`Failed to upsert card ${card.id}:`, error.message);
    return false;
  }

  return true;
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
  console.log("📋 Fetching expansion list...");

  // The expansion list spans multiple pages
  const allExpansions: Expansion[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url =
      page === 1
        ? `${BASE_URL}/id/card-search/`
        : `${BASE_URL}/id/card-search/?pageNo=${page}`;

    try {
      const html = await fetchWithRetry(url);
      const expansions = parseExpansionList(html);

      // Check if we found new expansions
      const newExpansions = expansions.filter(
        (e) => !allExpansions.find((ae) => ae.code === e.code)
      );

      if (newExpansions.length > 0) {
        allExpansions.push(...newExpansions);
        console.log(`  Page ${page}: ${newExpansions.length} expansions`);
        page++;
        await delay(DELAY_MS);
      } else {
        hasMore = false;
      }

      // Safety limit
      if (page > 10) hasMore = false;
    } catch (error) {
      console.error(`  Error fetching page ${page}:`, (error as Error).message);
      hasMore = false;
    }
  }

  console.log(`  Total expansions found: ${allExpansions.length}\n`);
  return allExpansions;
}

// --- Main Entry Point ---

async function main(): Promise<void> {
  console.log(
    "╔══════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║           POKEMON TCG INDONESIA - FULL SCRAPER                   ║"
  );
  console.log(
    "║        Scrapes all cards with rarity from all expansions         ║"
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════╝\n"
  );

  initDatabase();

  const args = process.argv.slice(2);
  const testMode = args.includes("--test");
  const rarityOnly = args.includes("--rarity-only");
  const setArg = args.find((a) => !a.startsWith("--"));

  const initialCount = await getCardCount();
  console.log(`📊 Current cards in database: ${initialCount}\n`);

  let expansionsToProcess: Expansion[] = [];

  if (setArg) {
    // Process specific set
    expansionsToProcess = [{ code: setArg, name: setArg }];
    console.log(`🎯 Processing specific set: ${setArg}`);
  } else {
    // Fetch all expansions
    expansionsToProcess = await fetchAllExpansions();
  }

  if (testMode && expansionsToProcess.length > 1) {
    expansionsToProcess = expansionsToProcess.slice(0, 1);
    console.log("🧪 Test mode: Processing only first expansion");
  }

  const progress: ScrapeProgress = {
    totalExpansions: expansionsToProcess.length,
    currentExpansion: 0,
    totalCards: 0,
    cardsUpdated: 0,
    errors: [],
  };

  // Process each expansion
  for (const expansion of expansionsToProcess) {
    progress.currentExpansion++;
    await processExpansion(expansion, progress, {
      rarityOnly,
      fullScrape: !rarityOnly,
    });
  }

  // Summary
  const finalCount = await getCardCount();

  console.log(
    "\n╔══════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                        SCRAPE COMPLETE                           ║"
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════╝"
  );
  console.log(`   Expansions processed: ${progress.totalExpansions}`);
  console.log(`   Cards scraped/updated: ${progress.cardsUpdated}`);
  console.log(`   Errors: ${progress.errors.length}`);
  console.log(
    `   Total cards in database: ${finalCount} (+${finalCount - initialCount})`
  );

  if (progress.errors.length > 0 && progress.errors.length <= 20) {
    console.log("\n❌ Errors:");
    progress.errors.forEach((e) => console.log(`   - ${e}`));
  } else if (progress.errors.length > 20) {
    console.log(`\n❌ Too many errors (${progress.errors.length}). First 10:`);
    progress.errors.slice(0, 10).forEach((e) => console.log(`   - ${e}`));
  }
}

// Run
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
