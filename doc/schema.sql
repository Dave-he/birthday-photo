-- Create the photos table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  position_index INTEGER,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow everyone to read photos
CREATE POLICY "Public photos are viewable by everyone" 
ON photos FOR SELECT 
USING (true);

-- Allow authenticated users (admins) to insert/update/delete
CREATE POLICY "Admins can insert photos" 
ON photos FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update photos" 
ON photos FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete photos" 
ON photos FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create Storage Bucket for photos
-- Note: You usually need to create this via the Supabase Dashboard UI or use the API
-- Bucket Name: 'photos'
-- Public: true

-- Storage Policies (if creating via SQL is supported or for reference)
-- Allow public read access to 'photos' bucket
-- (This usually needs to be configured in Storage > Policies in Dashboard)
