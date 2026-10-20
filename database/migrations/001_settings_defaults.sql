-- ==========================================
-- Migration: landing configuration columns
-- ==========================================
-- The 3D client persists the landing scene / visual mode / gallery layout
-- from its HUD ("Save Configuration" button). Older databases were created
-- from schema.sql before those columns existed, so this migration is written
-- to be idempotent and safe to re-run.
--
-- Run it once against an existing database:
--   psql ... -f database/migrations/001_settings_defaults.sql
-- or paste it into the Supabase SQL Editor.

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS default_scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL;

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS default_mode TEXT
  CHECK (default_mode IN ('christmas', 'birthday', 'romantic', 'party'));

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS default_layout TEXT
  CHECK (default_layout IN ('tree', 'helix', 'sphere', 'grid'));

-- A fresh install has no settings row yet; seed one so the admin panel and
-- the HUD have something to write to.
INSERT INTO settings (greeting_title)
SELECT 'Merry Christmas & Happy Birthday!'
WHERE NOT EXISTS (SELECT 1 FROM settings);
