-- V2 Schema Update: Scenes, Members, and Tags

-- 1. Create Scenes Table (e.g., "Christmas 2023", "Birthday Party")
CREATE TABLE scenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Members Table (e.g., "Alice", "Bob", "Grandma")
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Update Photos Table
-- Add Foreign Keys
ALTER TABLE photos ADD COLUMN scene_id UUID REFERENCES scenes(id);
ALTER TABLE photos ADD COLUMN member_id UUID REFERENCES members(id);
-- Add Tags (using Postgres Array)
ALTER TABLE photos ADD COLUMN tags TEXT[];

-- 4. Enable RLS for new tables
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Scenes
CREATE POLICY "Public scenes are viewable by everyone" ON scenes FOR SELECT USING (true);
CREATE POLICY "Admins can manage scenes" ON scenes FOR ALL USING (auth.role() = 'authenticated');

-- 6. Policies for Members
CREATE POLICY "Public members are viewable by everyone" ON members FOR SELECT USING (true);
CREATE POLICY "Admins can manage members" ON members FOR ALL USING (auth.role() = 'authenticated');
