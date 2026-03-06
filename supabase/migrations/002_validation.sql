-- =============================================================
-- Schools Are Forests — Validation Trees & PlantNet Confidence
-- Run this in Supabase SQL Editor AFTER migration 001
-- =============================================================

-- -------------------------------------------------------
-- 1. PlantNet confidence score on trees
-- When PlantNet identifies a species and the student accepts it,
-- we save the confidence % (0-100). NULL if not used.
-- -------------------------------------------------------
ALTER TABLE trees ADD COLUMN IF NOT EXISTS species_confidence float;


-- -------------------------------------------------------
-- 2. Tree validations table
-- The teacher re-measures a randomly assigned tree to
-- verify student measurement quality.
-- accuracy_pct is calculated and stored when the teacher saves.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS tree_validations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id       uuid NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  zone_id       uuid NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  school_id     text NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  validated_by  uuid NOT NULL REFERENCES teachers(id),
  -- Teacher's own measurements (student's are in the trees table)
  height_m      float,
  crown_ns_m    float,
  crown_ew_m    float,
  health_status text,
  notes         text,
  accuracy_pct  float,    -- 0-100, average across all numeric fields measured
  validated_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tree_validations_tree   ON tree_validations(tree_id);
CREATE INDEX IF NOT EXISTS idx_tree_validations_zone   ON tree_validations(zone_id);
CREATE INDEX IF NOT EXISTS idx_tree_validations_school ON tree_validations(school_id);

-- =============================================================
-- DONE. After running this, deploy the frontend.
-- =============================================================
