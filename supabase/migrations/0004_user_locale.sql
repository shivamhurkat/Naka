-- =============================================================================
-- Naka — 0004_user_locale.sql
-- Adds locale preference column to users so language choice persists
-- across devices. Default is Hindi ('hi').
-- =============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'hi';

ALTER TABLE users ADD CONSTRAINT users_locale_check
  CHECK (locale IN ('hi', 'en'));
