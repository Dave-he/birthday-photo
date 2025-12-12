-- Migration: Add mode cycle fields to settings
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS auto_mode_cycle_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS mode_cycle_min_seconds INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS mode_cycle_max_seconds INTEGER DEFAULT 180;

-- Optional: ensure existing row has sensible values
UPDATE settings
SET 
  auto_mode_cycle_enabled = COALESCE(auto_mode_cycle_enabled, true),
  mode_cycle_min_seconds = COALESCE(mode_cycle_min_seconds, 60),
  mode_cycle_max_seconds = COALESCE(mode_cycle_max_seconds, 180);
