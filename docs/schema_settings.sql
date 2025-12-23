
-- Create the settings table (Singleton pattern intended)
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bg_music_url TEXT,
  snow_density INTEGER DEFAULT 100,
  is_snowing BOOLEAN DEFAULT true,
  greeting_title TEXT DEFAULT 'Merry Christmas & Happy Birthday!',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public settings are viewable by everyone" 
ON settings FOR SELECT 
USING (true);

CREATE POLICY "Admins can update settings" 
ON settings FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert settings" 
ON settings FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Initialize default settings row (optional, user can create via admin)
INSERT INTO settings (bg_music_url, snow_density, is_snowing, greeting_title)
VALUES ('https://example.com/jingle-bells.mp3', 200, true, 'Merry Christmas!');
