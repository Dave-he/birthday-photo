-- Full Schema for Birthday Photo App (V2)
-- Includes: Photos, Settings, Scenes, Members

-- ==========================================
-- 1. SCENES (场景)
-- ==========================================
CREATE TABLE IF NOT EXISTS scenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public scenes are viewable by everyone" ON scenes FOR SELECT USING (true);
CREATE POLICY "Admins can manage scenes" ON scenes FOR ALL USING (auth.role() = 'authenticated');


-- ==========================================
-- 2. MEMBERS (成员)
-- ==========================================
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public members are viewable by everyone" ON members FOR SELECT USING (true);
CREATE POLICY "Admins can manage members" ON members FOR ALL USING (auth.role() = 'authenticated');


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
  
  -- V2: Foreign Keys
  scene_id UUID REFERENCES scenes(id),
  member_id UUID REFERENCES members(id),
  tags TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public photos are viewable by everyone" ON photos FOR SELECT USING (true);

-- Admin Policies
CREATE POLICY "Admins can insert photos" ON photos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update photos" ON photos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete photos" ON photos FOR DELETE USING (auth.role() = 'authenticated');


-- ==========================================
-- 4. SETTINGS (全局设置)
-- ==========================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bg_music_url TEXT,
  snow_density INTEGER DEFAULT 100,
  is_snowing BOOLEAN DEFAULT true,
  greeting_title TEXT DEFAULT 'Merry Christmas & Happy Birthday!',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public settings are viewable by everyone" ON settings FOR SELECT USING (true);

-- Admin Policies
CREATE POLICY "Admins can update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert settings" ON settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Initialize default settings row if empty
INSERT INTO settings (bg_music_url, snow_density, is_snowing, greeting_title)
SELECT 'https://example.com/jingle-bells.mp3', 200, true, 'Merry Christmas!'
WHERE NOT EXISTS (SELECT 1 FROM settings);
