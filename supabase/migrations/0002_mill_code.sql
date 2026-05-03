-- =============================================================================
-- Naka — 0002_mill_code.sql
-- Adds a short human-readable mill code (e.g. "DEMO01") used at login.
-- Run AFTER 0001_init.sql. Safe to run before or after seed.sql.
-- =============================================================================

-- Add nullable first so the constraint can be applied after backfill
ALTER TABLE mills ADD COLUMN IF NOT EXISTS code text;

-- Backfill the demo mill if seed.sql has already been run
UPDATE mills SET code = 'DEMO01' WHERE name = 'Hinganghat Demo Mill' AND code IS NULL;

-- Now enforce NOT NULL and uniqueness
ALTER TABLE mills ALTER COLUMN code SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mills_code_key' AND conrelid = 'mills'::regclass
  ) THEN
    ALTER TABLE mills ADD CONSTRAINT mills_code_key UNIQUE (code);
  END IF;
END $$;

-- Add to RLS policy so members can look up their mill by code (for login)
-- Login uses the admin client so this is defence-in-depth only
CREATE POLICY "anyone_select_mill_by_code" ON mills
  FOR SELECT USING (true);  -- login needs to resolve code → id before auth

-- Note: the previous "mill_member_select" policy already exists.
-- Postgres evaluates multiple SELECT policies with OR — any matching policy grants access.
