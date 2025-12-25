-- ==========================================
-- Birthday Photo App - Row Level Security Policies
-- ==========================================
-- This file contains all RLS policies for database security
-- Run this after schema.sql to set up access control

-- ==========================================
-- Enable Row Level Security
-- ==========================================
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SCENES Policies
-- ==========================================
-- Public read access
CREATE POLICY "Public scenes are viewable by everyone" 
ON scenes FOR SELECT 
USING (true);

-- Admin full access
CREATE POLICY "Admins can manage scenes" 
ON scenes FOR ALL 
USING (auth.role() = 'authenticated');

-- ==========================================
-- MEMBERS Policies
-- ==========================================
-- Public read access
CREATE POLICY "Public members are viewable by everyone" 
ON members FOR SELECT 
USING (true);

-- Admin full access
CREATE POLICY "Admins can manage members" 
ON members FOR ALL 
USING (auth.role() = 'authenticated');

-- ==========================================
-- PHOTOS Policies
-- ==========================================
-- Public read access
CREATE POLICY "Public photos are viewable by everyone" 
ON photos FOR SELECT 
USING (true);

-- Admin insert access
CREATE POLICY "Admins can insert photos" 
ON photos FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Admin update access
CREATE POLICY "Admins can update photos" 
ON photos FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Admin delete access
CREATE POLICY "Admins can delete photos" 
ON photos FOR DELETE 
USING (auth.role() = 'authenticated');

-- ==========================================
-- SETTINGS Policies
-- ==========================================
-- Public read access
CREATE POLICY "Public settings are viewable by everyone" 
ON settings FOR SELECT 
USING (true);

-- Admin insert access
CREATE POLICY "Admins can insert settings" 
ON settings FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Admin update access
CREATE POLICY "Admins can update settings" 
ON settings FOR UPDATE 
USING (auth.role() = 'authenticated');

-- ==========================================
-- Storage Policies
-- ==========================================
-- Note: Storage policies should be configured via Supabase Dashboard
-- Recommended policies for 'photos' bucket:
-- 1. Public read access: Allow SELECT for all users
-- 2. Admin upload: Allow INSERT for authenticated users
-- 3. Admin delete: Allow DELETE for authenticated users
