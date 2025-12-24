-- ============================================================================
-- Pokemon TCG Indonesia Database Schema Restructure
-- ============================================================================
-- 
-- This migration:
-- 1. Adds new columns to idn_cards for better Trainer/Energy support
-- 2. Creates normalized tables for attacks and abilities
-- 3. Creates a search text table for fast text searching
-- 4. Migrates existing JSONB data to the new structure
-- 5. Old JSONB columns (attacks, abilities) are kept for safety - can be dropped later
--
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================================

-- ============================================================================
-- STEP 1: Add new columns to idn_cards
-- ============================================================================

-- Add subtype column (for Trainer subtypes: Supporter, Item, Stadium, Tool, etc.)
-- This is different from "stage" which is for Pokemon evolution stages
ALTER TABLE idn_cards 
ADD COLUMN IF NOT EXISTS subtype TEXT;

-- Add effect_text column (main effect text for Trainer and Special Energy cards)
ALTER TABLE idn_cards 
ADD COLUMN IF NOT EXISTS effect_text TEXT;

-- Comment for clarity
COMMENT ON COLUMN idn_cards.subtype IS 'Trainer subtype (Supporter, Item, Stadium, Tool) or Energy subtype (Basic, Special)';
COMMENT ON COLUMN idn_cards.effect_text IS 'Main effect text for Trainer cards and Special Energy cards';
COMMENT ON COLUMN idn_cards.stage IS 'Pokemon evolution stage (Basic, Stage 1, Stage 2, V, VMAX, VSTAR, ex, etc.)';

-- ============================================================================
-- STEP 2: Create normalized idn_card_attacks table
-- ============================================================================

CREATE TABLE IF NOT EXISTS idn_card_attacks (
  id SERIAL PRIMARY KEY,
  card_id TEXT NOT NULL REFERENCES idn_cards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cost TEXT[] DEFAULT '{}',  -- Array of energy types (e.g., ['Fire', 'Colorless', 'Colorless'])
  damage TEXT,               -- Damage value (e.g., '120', '30+', '60×')
  effect TEXT,               -- Attack effect description
  position INTEGER DEFAULT 0, -- Order of the attack on the card
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_attacks_card_id ON idn_card_attacks(card_id);
CREATE INDEX IF NOT EXISTS idx_card_attacks_name ON idn_card_attacks(name);

COMMENT ON TABLE idn_card_attacks IS 'Pokemon card attacks - normalized from JSONB';

-- ============================================================================
-- STEP 3: Create normalized idn_card_abilities table
-- ============================================================================

CREATE TABLE IF NOT EXISTS idn_card_abilities (
  id SERIAL PRIMARY KEY,
  card_id TEXT NOT NULL REFERENCES idn_cards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Ability',  -- Ability type (Ability, Poke-Power, Poke-Body, Ancient Trait, etc.)
  effect TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_abilities_card_id ON idn_card_abilities(card_id);
CREATE INDEX IF NOT EXISTS idx_card_abilities_name ON idn_card_abilities(name);

COMMENT ON TABLE idn_card_abilities IS 'Pokemon card abilities - normalized from JSONB';

-- ============================================================================
-- STEP 4: Create search text table for fast text searching
-- ============================================================================

CREATE TABLE IF NOT EXISTS idn_card_search_text (
  card_id TEXT PRIMARY KEY REFERENCES idn_cards(id) ON DELETE CASCADE,
  search_text TEXT NOT NULL,  -- Concatenated searchable text
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for text search (using GIN trigram for partial matching)
-- First, enable the extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_card_search_text_gin 
ON idn_card_search_text USING GIN (search_text gin_trgm_ops);

-- Also create a regular btree index for exact prefix matching
CREATE INDEX IF NOT EXISTS idx_card_search_text_btree 
ON idn_card_search_text(search_text text_pattern_ops);

COMMENT ON TABLE idn_card_search_text IS 'Denormalized search text combining card name, attacks, abilities, and effects for fast text search';

-- ============================================================================
-- STEP 5: Migrate existing JSONB data to new tables
-- ============================================================================

-- 5a. Migrate attacks from JSONB to idn_card_attacks
INSERT INTO idn_card_attacks (card_id, name, cost, damage, effect, position)
SELECT 
  c.id AS card_id,
  (attack->>'name')::TEXT AS name,
  COALESCE(
    ARRAY(SELECT jsonb_array_elements_text(attack->'cost')),
    '{}'
  ) AS cost,
  (attack->>'damage')::TEXT AS damage,
  (attack->>'effect')::TEXT AS effect,
  (row_number() OVER (PARTITION BY c.id ORDER BY ordinality))::INTEGER - 1 AS position
FROM idn_cards c
CROSS JOIN LATERAL jsonb_array_elements(c.attacks) WITH ORDINALITY AS arr(attack, ordinality)
WHERE c.attacks IS NOT NULL AND jsonb_array_length(c.attacks) > 0
ON CONFLICT DO NOTHING;

-- 5b. Migrate abilities from JSONB to idn_card_abilities
INSERT INTO idn_card_abilities (card_id, name, type, effect, position)
SELECT 
  c.id AS card_id,
  (ability->>'name')::TEXT AS name,
  COALESCE((ability->>'type')::TEXT, 'Ability') AS type,
  (ability->>'effect')::TEXT AS effect,
  (row_number() OVER (PARTITION BY c.id ORDER BY ordinality))::INTEGER - 1 AS position
FROM idn_cards c
CROSS JOIN LATERAL jsonb_array_elements(c.abilities) WITH ORDINALITY AS arr(ability, ordinality)
WHERE c.abilities IS NOT NULL AND jsonb_array_length(c.abilities) > 0
ON CONFLICT DO NOTHING;

-- 5c. Update subtype for Trainer cards based on current stage column
-- (The scraper was storing trainer subtypes in the stage column)
UPDATE idn_cards
SET subtype = stage
WHERE category = 'Trainer' 
  AND stage IN ('Supporter', 'Item', 'Stadium', 'Tool');

-- Set stage to NULL for Trainer cards (they don't have evolution stages)
UPDATE idn_cards
SET stage = NULL
WHERE category = 'Trainer';

-- Set subtype for Energy cards
UPDATE idn_cards
SET subtype = CASE 
  WHEN stage = 'Basic' THEN 'Basic'
  ELSE 'Special'
END
WHERE category = 'Energy';

-- Set stage to NULL for Energy cards
UPDATE idn_cards
SET stage = NULL
WHERE category = 'Energy';

-- ============================================================================
-- STEP 6: Populate search text table
-- ============================================================================

-- Build search text from:
-- - Card name
-- - Attack names and effects
-- - Ability names and effects  
-- - Trainer/Energy effect_text
INSERT INTO idn_card_search_text (card_id, search_text, updated_at)
SELECT 
  c.id,
  LOWER(
    COALESCE(c.name, '') || ' ' ||
    COALESCE(c.effect_text, '') || ' ' ||
    COALESCE(
      (SELECT string_agg(COALESCE(a.name, '') || ' ' || COALESCE(a.effect, ''), ' ')
       FROM idn_card_attacks a WHERE a.card_id = c.id),
      ''
    ) || ' ' ||
    COALESCE(
      (SELECT string_agg(COALESCE(ab.name, '') || ' ' || COALESCE(ab.effect, ''), ' ')
       FROM idn_card_abilities ab WHERE ab.card_id = c.id),
      ''
    )
  ) AS search_text,
  NOW()
FROM idn_cards c
ON CONFLICT (card_id) DO UPDATE SET
  search_text = EXCLUDED.search_text,
  updated_at = NOW();

-- ============================================================================
-- STEP 7: Create function to auto-update search text on card changes
-- ============================================================================

CREATE OR REPLACE FUNCTION update_card_search_text()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO idn_card_search_text (card_id, search_text, updated_at)
  SELECT 
    NEW.id,
    LOWER(
      COALESCE(NEW.name, '') || ' ' ||
      COALESCE(NEW.effect_text, '') || ' ' ||
      COALESCE(
        (SELECT string_agg(COALESCE(a.name, '') || ' ' || COALESCE(a.effect, ''), ' ')
         FROM idn_card_attacks a WHERE a.card_id = NEW.id),
        ''
      ) || ' ' ||
      COALESCE(
        (SELECT string_agg(COALESCE(ab.name, '') || ' ' || COALESCE(ab.effect, ''), ' ')
         FROM idn_card_abilities ab WHERE ab.card_id = NEW.id),
        ''
      )
    ),
    NOW()
  ON CONFLICT (card_id) DO UPDATE SET
    search_text = EXCLUDED.search_text,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on idn_cards insert/update
DROP TRIGGER IF EXISTS trg_update_card_search_text ON idn_cards;
CREATE TRIGGER trg_update_card_search_text
AFTER INSERT OR UPDATE ON idn_cards
FOR EACH ROW
EXECUTE FUNCTION update_card_search_text();

-- Also update search text when attacks change
CREATE OR REPLACE FUNCTION update_search_text_on_attack_change()
RETURNS TRIGGER AS $$
DECLARE
  target_card_id TEXT;
BEGIN
  target_card_id := COALESCE(NEW.card_id, OLD.card_id);
  
  UPDATE idn_card_search_text
  SET 
    search_text = LOWER(
      COALESCE((SELECT name FROM idn_cards WHERE id = target_card_id), '') || ' ' ||
      COALESCE((SELECT effect_text FROM idn_cards WHERE id = target_card_id), '') || ' ' ||
      COALESCE(
        (SELECT string_agg(COALESCE(a.name, '') || ' ' || COALESCE(a.effect, ''), ' ')
         FROM idn_card_attacks a WHERE a.card_id = target_card_id),
        ''
      ) || ' ' ||
      COALESCE(
        (SELECT string_agg(COALESCE(ab.name, '') || ' ' || COALESCE(ab.effect, ''), ' ')
         FROM idn_card_abilities ab WHERE ab.card_id = target_card_id),
        ''
      )
    ),
    updated_at = NOW()
  WHERE card_id = target_card_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_search_on_attack ON idn_card_attacks;
CREATE TRIGGER trg_update_search_on_attack
AFTER INSERT OR UPDATE OR DELETE ON idn_card_attacks
FOR EACH ROW
EXECUTE FUNCTION update_search_text_on_attack_change();

-- Same for abilities
DROP TRIGGER IF EXISTS trg_update_search_on_ability ON idn_card_abilities;
CREATE TRIGGER trg_update_search_on_ability
AFTER INSERT OR UPDATE OR DELETE ON idn_card_abilities
FOR EACH ROW
EXECUTE FUNCTION update_search_text_on_attack_change();

-- ============================================================================
-- STEP 8: Grant permissions for RLS (Row Level Security)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE idn_card_attacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE idn_card_abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE idn_card_search_text ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON idn_card_attacks
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON idn_card_abilities
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON idn_card_search_text
  FOR SELECT USING (true);

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify the migration)
-- ============================================================================

-- Check attack count migration
-- SELECT 
--   (SELECT COUNT(*) FROM idn_card_attacks) AS attacks_in_new_table,
--   (SELECT SUM(jsonb_array_length(attacks)) FROM idn_cards WHERE attacks IS NOT NULL) AS attacks_in_jsonb;

-- Check ability count migration
-- SELECT 
--   (SELECT COUNT(*) FROM idn_card_abilities) AS abilities_in_new_table,
--   (SELECT SUM(jsonb_array_length(abilities)) FROM idn_cards WHERE abilities IS NOT NULL) AS abilities_in_jsonb;

-- Check search text population
-- SELECT COUNT(*) AS cards_with_search_text FROM idn_card_search_text;

-- Sample search test
-- SELECT c.id, c.name, c.category, st.search_text
-- FROM idn_cards c
-- JOIN idn_card_search_text st ON st.card_id = c.id
-- WHERE st.search_text ILIKE '%ember%'
-- LIMIT 5;

-- ============================================================================
-- CLEANUP (Run AFTER verifying everything works - OPTIONAL)
-- ============================================================================

-- Once verified, you can drop the old JSONB columns:
-- ALTER TABLE idn_cards DROP COLUMN IF EXISTS attacks;
-- ALTER TABLE idn_cards DROP COLUMN IF EXISTS abilities;

-- Delete the old RPC function if it exists
-- DROP FUNCTION IF EXISTS search_cards_with_attacks;
