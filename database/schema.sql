-- ==========================================
-- Birthday Photo App - Database Schema
-- ==========================================
-- This file contains all table definitions and indexes
-- Run this first to create the database structure

-- ==========================================
-- 1. SCENES (场景)
-- ==========================================
CREATE TABLE IF NOT EXISTS scenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. MEMBERS (成员)
-- ==========================================
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. PHOTOS (照片)
-- ==========================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  position_index INTEGER,
  is_featured BOOLEAN DEFAULT false,
  
  -- Foreign Keys
  scene_id UUID REFERENCES scenes(id),
  member_id UUID REFERENCES members(id),
  tags TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. SETTINGS (全局设置)
-- ==========================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bg_music_url TEXT,
  snow_density INTEGER DEFAULT 100,
  is_snowing BOOLEAN DEFAULT true,
  greeting_title TEXT DEFAULT 'Merry Christmas & Happy Birthday!',

  -- Landing configuration (written by the 3D HUD "Save Configuration"
  -- button and by the admin panel)
  default_scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,
  default_mode TEXT CHECK (default_mode IN ('christmas', 'birthday', 'romantic', 'party')),
  default_layout TEXT CHECK (default_layout IN ('tree', 'helix', 'sphere', 'grid')),

  -- Mode cycle settings
  auto_mode_cycle_enabled BOOLEAN DEFAULT true,
  mode_cycle_min_seconds INTEGER DEFAULT 60,
  mode_cycle_max_seconds INTEGER DEFAULT 180,
  
  -- Performance settings
  low_quality_mode BOOLEAN DEFAULT false,
  particle_multiplier NUMERIC DEFAULT 1,
  rotate_speed NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Storage Buckets
-- ==========================================
-- The buckets themselves (and their policies) are created by storage.sql:
--   photos  images only  (the gallery)
--   music   audio only   (the background track)
-- Both are public read buckets, uploads require an authenticated admin.
