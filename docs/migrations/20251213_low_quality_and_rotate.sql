-- Migration: Add low quality and rotate speed fields to settings
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS low_quality_mode BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS particle_multiplier NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS rotate_speed NUMERIC;

UPDATE settings
SET 
  low_quality_mode = COALESCE(low_quality_mode, false),
  particle_multiplier = COALESCE(particle_multiplier, 1)
WHERE true;
