-- =============================================================
-- Schools Are Forests — School Ownership Migration
-- Run this in your Supabase SQL Editor
-- =============================================================

-- Add owner_id to schools table.
-- This points to the teacher who is the primary responsible for the school.
-- NULL means ownership hasn't been explicitly set (legacy schools).
ALTER TABLE schools ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES teachers(id) ON DELETE SET NULL;
