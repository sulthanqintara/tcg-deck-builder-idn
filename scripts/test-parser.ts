#!/usr/bin/env tsx
/**
 * Test script to verify parsing of different card types
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import * as cheerio from "cheerio";

const BASE_URL = "https://asia.pokemon-card.com";

// Test URLs for different card types
const TEST_CARDS = {
  // Pokemon
  basic: "16815", // Oddish
  stage1: "16816", // Gloom
  stage2: "16817", // Vileplume
  vstar: "6706", // Leafeon VSTAR
  vmax: "8411", // Charizard VMAX
  // Trainer
  item: "16903", // Pengalih Energi
  supporter: "16913", // Dawn
  stadium: "16916", // Kolosium Pertarungan
  tool: "16910", // Jimat Suci
  // Energy
  basicEnergy: "15357", // Energi Dasar Kegelapan
  specialEnergy: "16310", // Energi Penyulut
};

// Trainer subtypes mapping
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

// Energy subtypes mapping
const ENERGY_SUBTYPES: Record<string, string> = {
  "energi dasar": "Basic",
  "basic energy": "Basic",
  "energi spesial": "Special",
  "special energy": "Special",
  "energi khusus": "Special",
};

// Pokemon stage patterns
const POKEMON_STAGE_PATTERNS: { pattern: RegExp; stage: string }[] = [
  { pattern: /\bVSTAR\b/i, stage: "VSTAR" },
  { pattern: /\bVMAX\b/i, stage: "VMAX" },
  { pattern: /\bV\b(?!MAX|STAR)/i, stage: "V" },
  { pattern: /\bGX\b/i, stage: "GX" },
  { pattern: /\bEX\b/i, stage: "EX" },
  { pattern: /\bex\b/, stage: "ex" },
  { pattern: /\bBreak\b/i, stage: "BREAK" },
];

function detectPokemonStage(
  h1Text: string,
  evolveMarker: string
): string | null {
  const lowerMarker = evolveMarker.toLowerCase().trim();

  if (lowerMarker === "basic" || lowerMarker === "dasar") return "Basic";
  if (lowerMarker === "stage 1" || lowerMarker === "tahap 1") return "Stage 1";
  if (lowerMarker === "stage 2" || lowerMarker === "tahap 2") return "Stage 2";

  const textToCheck = `${h1Text} ${evolveMarker}`;
  for (const { pattern, stage } of POKEMON_STAGE_PATTERNS) {
    if (pattern.test(textToCheck)) {
      return stage;
    }
  }

  return null;
}

function detectTrainerSubtype(subtypeText: string): string | null {
  const lower = subtypeText.toLowerCase().trim();
  return TRAINER_SUBTYPES[lower] || null;
}

function detectEnergySubtype(subtypeText: string): string | null {
  const lower = subtypeText.toLowerCase().trim();
  return ENERGY_SUBTYPES[lower] || null;
}

interface ParsedCard {
  id: string;
  name: string;
  category: "Pokemon" | "Trainer" | "Energy";
  subtype: string | null;
  stage: string | null;
  effectText: string | null;
  hp: number | null;
  attacks: { name: string; damage: string | null; effect: string | null }[];
  abilities: { name: string; effect: string }[];
}

async function fetchCard(cardId: string): Promise<string> {
  const url = `${BASE_URL}/id/card-search/detail/${cardId}/`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  return res.text();
}

function parseCard(html: string, cardId: string): ParsedCard {
  const $ = cheerio.load(html);

  const h1El = $("h1").first();
  const titleText = h1El.text().trim();
  const evolveMarker = h1El.find(".evolveMarker").text().toLowerCase().trim();

  // Extract name
  let name = titleText;
  const h1Clone = h1El.clone();
  h1Clone.find(".evolveMarker").remove();
  const nameOnly = h1Clone.text().trim();
  if (nameOnly) {
    name = nameOnly
      .replace(/^lainnya\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  let category: "Pokemon" | "Trainer" | "Energy" = "Pokemon";
  let subtype: string | null = null;
  let stage: string | null = null;
  let effectText: string | null = null;

  // Check H3 headings
  const h3Elements = $("h3");
  let foundCardType = false;

  h3Elements.each((_, h3El) => {
    if (foundCardType) return;

    const h3Text = $(h3El).text().trim();

    // Check for Trainer subtypes
    const trainerSubtype = detectTrainerSubtype(h3Text);
    if (trainerSubtype) {
      category = "Trainer";
      subtype = trainerSubtype;
      foundCardType = true;

      // Get effect text - next sibling elements until next section
      const siblings = $(h3El).nextUntil("h3, .illustrator, table");
      let effectContent = "";
      siblings.each((_, sib) => {
        const text = $(sib).text().trim();
        if (text && !text.match(/^[A-Z]\s+\d{3}\/\d+/)) {
          effectContent += " " + text;
        }
      });
      effectText = effectContent.trim() || null;
      return;
    }

    // Check for Energy subtypes
    const energySubtype = detectEnergySubtype(h3Text);
    if (energySubtype) {
      category = "Energy";
      subtype = energySubtype;
      foundCardType = true;

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
  });

  // If Pokemon, detect stage
  if (category === "Pokemon") {
    stage = detectPokemonStage(titleText, evolveMarker);
  }

  // Get HP
  let hp: number | null = null;
  const hpSpan = $(".mainInfomation .number, .hp .number").first();
  if (hpSpan.length) {
    const hpVal = parseInt(hpSpan.text().trim(), 10);
    if (!isNaN(hpVal)) hp = hpVal;
  }

  // Get attacks
  const attacks: {
    name: string;
    damage: string | null;
    effect: string | null;
  }[] = [];
  $(".skillInformation .skill, .skill").each((_, skillEl) => {
    const $skill = $(skillEl);
    const attackName = $skill.find(".skillName").text().trim();
    if (!attackName) return;
    const damage = $skill.find(".skillDamage").text().trim() || null;
    const effect = $skill.find(".skillEffect").text().trim() || null;
    attacks.push({ name: attackName, damage, effect });
  });

  // Get abilities
  const abilities: { name: string; effect: string }[] = [];
  $(".talentInformation .talent, .ability").each((_, el) => {
    const $ability = $(el);
    const abilityName = $ability
      .find(".talentName, .abilityName")
      .text()
      .trim();
    const effect = $ability
      .find(".talentEffect, .abilityEffect, p")
      .text()
      .trim();
    if (abilityName) {
      abilities.push({ name: abilityName, effect });
    }
  });

  return {
    id: cardId,
    name,
    category,
    subtype,
    stage,
    effectText,
    hp,
    attacks,
    abilities,
  };
}

async function main() {
  console.log("🧪 Testing Card Parser");
  console.log("=".repeat(60));

  for (const [type, cardId] of Object.entries(TEST_CARDS)) {
    console.log(`\n📋 Testing ${type.toUpperCase()} (ID: ${cardId})`);
    console.log("-".repeat(40));

    try {
      const html = await fetchCard(cardId);
      const card = parseCard(html, cardId);

      console.log(`  Name: ${card.name}`);
      console.log(`  Category: ${card.category}`);
      console.log(`  Subtype: ${card.subtype || "N/A"}`);
      console.log(`  Stage: ${card.stage || "N/A"}`);
      console.log(`  HP: ${card.hp || "N/A"}`);

      if (card.attacks.length > 0) {
        console.log(`  Attacks: ${card.attacks.map((a) => a.name).join(", ")}`);
      }

      if (card.abilities.length > 0) {
        console.log(
          `  Abilities: ${card.abilities.map((a) => a.name).join(", ")}`
        );
      }

      if (card.effectText) {
        console.log(
          `  Effect: ${card.effectText.slice(0, 100)}${
            card.effectText.length > 100 ? "..." : ""
          }`
        );
      }

      // Validation
      const issues: string[] = [];

      if (type.includes("stage") && card.category !== "Pokemon") {
        issues.push("Expected Pokemon category");
      }
      if (type === "item" && card.subtype !== "Item") {
        issues.push(`Expected Item subtype, got ${card.subtype}`);
      }
      if (type === "supporter" && card.subtype !== "Supporter") {
        issues.push(`Expected Supporter subtype, got ${card.subtype}`);
      }
      if (type === "stadium" && card.subtype !== "Stadium") {
        issues.push(`Expected Stadium subtype, got ${card.subtype}`);
      }
      if (type === "tool" && card.subtype !== "Pokemon Tool") {
        issues.push(`Expected Pokemon Tool subtype, got ${card.subtype}`);
      }
      if (type === "basicEnergy" && card.subtype !== "Basic") {
        issues.push(`Expected Basic subtype, got ${card.subtype}`);
      }
      if (type === "specialEnergy" && card.subtype !== "Special") {
        issues.push(`Expected Special subtype, got ${card.subtype}`);
      }
      if (type === "basic" && card.stage !== "Basic") {
        issues.push(`Expected Basic stage, got ${card.stage}`);
      }
      if (type === "vstar" && card.stage !== "VSTAR") {
        issues.push(`Expected VSTAR stage, got ${card.stage}`);
      }
      if (type === "vmax" && card.stage !== "VMAX") {
        issues.push(`Expected VMAX stage, got ${card.stage}`);
      }

      if (issues.length > 0) {
        console.log(`  ⚠️ ISSUES: ${issues.join(", ")}`);
      } else {
        console.log(`  ✅ PASSED`);
      }
    } catch (error) {
      console.log(`  ❌ ERROR: ${(error as Error).message}`);
    }

    // Small delay
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\n" + "=".repeat(60));
  console.log("Testing complete!");
}

main().catch(console.error);
