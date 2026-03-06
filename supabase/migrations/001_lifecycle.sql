-- =============================================================
-- Schools Are Forests — Lifecycle & Security Migration
-- Run this once in your Supabase SQL Editor
-- =============================================================

-- -------------------------------------------------------
-- 1. TEACHER APPROVAL SYSTEM
-- Adds status field to teachers table.
-- 'pending'  = waiting for admin to approve
-- 'approved' = can access dashboard
-- 'rejected' = account denied (with optional reason)
-- -------------------------------------------------------
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- IMPORTANT: Existing teachers are already real — approve them all.
-- New registrations start as 'pending' automatically.
UPDATE teachers SET status = 'approved' WHERE status = 'pending';


-- -------------------------------------------------------
-- 2. ADMINS TABLE
-- Platform-level administrators (you and your team).
-- To make someone an admin, insert their Supabase user ID here.
-- There is NO public signup for admins — you do it manually.
--
-- How to add yourself as admin after running this:
--   INSERT INTO admins (id, email, name)
--   VALUES ('<your-supabase-user-uuid>', 'you@example.com', 'Your Name');
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  name        text,
  created_at  timestamptz DEFAULT now() NOT NULL
);


-- -------------------------------------------------------
-- 3. CLASS SESSIONS TABLE
-- Teachers create a time-limited session with a short code
-- (e.g. "FX7K2M"). Students enter this code at /student.
-- Sessions expire automatically after 3 hours.
-- Teachers can reactivate expired sessions with the same code.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS class_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id    uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  school_id     text NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  session_code  text NOT NULL,
  zone_ids      uuid[],         -- null = all zones allowed
  is_active     boolean NOT NULL DEFAULT false,
  notes         text,           -- e.g. "Grade 7B - Period 3"
  activated_at  timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz DEFAULT now() NOT NULL,
  UNIQUE(session_code)
);

CREATE INDEX IF NOT EXISTS idx_class_sessions_code   ON class_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_class_sessions_school ON class_sessions(school_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_teacher ON class_sessions(teacher_id);


-- -------------------------------------------------------
-- 4. INVENTORIES TABLE (Annual rounds)
-- Each year the teacher creates a new inventory.
-- Trees are tagged with inventory_id so you can compare
-- 2024 vs 2025 vs 2026 in graphs — the time series feature.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   text NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  year        integer NOT NULL,
  label       text NOT NULL,         -- e.g. "Inventory 2025 — Grade 8"
  status      text NOT NULL DEFAULT 'active',  -- 'active' | 'closed'
  created_by  uuid REFERENCES teachers(id),
  created_at  timestamptz DEFAULT now() NOT NULL,
  closed_at   timestamptz
);

CREATE INDEX IF NOT EXISTS idx_inventories_school ON inventories(school_id);


-- -------------------------------------------------------
-- 5. ADD inventory_id TO TREES
-- Existing trees get NULL (they belong to "before the system").
-- New trees (after teacher creates an inventory) get tagged.
-- -------------------------------------------------------
ALTER TABLE trees ADD COLUMN IF NOT EXISTS inventory_id uuid REFERENCES inventories(id);


-- =============================================================
-- DONE. After running this:
-- 1. Add yourself as admin (see step 2 above)
-- 2. Deploy the new frontend code
-- 3. Test by registering a new teacher account
-- =============================================================
