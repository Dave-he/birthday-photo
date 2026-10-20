-- ==========================================
-- Birthday Photo App - Storage Buckets & Policies
-- ==========================================
-- Two public buckets:
--   photos  images only  (the gallery)
--   music   audio only   (the background track)
--
-- Keeping them apart matters: a bucket carries a MIME-type whitelist, and an
-- MP3 uploaded into the image bucket is rejected by storage. The admin panel
-- used to upload background music into the `photos` bucket, so the upload
-- failed for every deployment that followed the documented whitelist.
--
-- This script is idempotent - it can be run against a fresh or an existing
-- database. Run it after schema.sql and policy.sql.

-- ==========================================
-- Buckets
-- ==========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'music',
  'music',
  true,
  20971520, -- 20 MB
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/flac', 'audio/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==========================================
-- Object policies
-- ==========================================
-- Anonymous visitors read the assets (the gallery and the track are part of
-- the public experience); only authenticated admins may write or delete.

DROP POLICY IF EXISTS "Public can read photos" ON storage.objects;
CREATE POLICY "Public can read photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Admins can upload photos" ON storage.objects;
CREATE POLICY "Admins can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "Admins can update photos" ON storage.objects;
CREATE POLICY "Admins can update photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Admins can delete photos" ON storage.objects;
CREATE POLICY "Admins can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Public can read music" ON storage.objects;
CREATE POLICY "Public can read music"
ON storage.objects FOR SELECT
USING (bucket_id = 'music');

DROP POLICY IF EXISTS "Admins can upload music" ON storage.objects;
CREATE POLICY "Admins can upload music"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'music');

DROP POLICY IF EXISTS "Admins can update music" ON storage.objects;
CREATE POLICY "Admins can update music"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'music');

DROP POLICY IF EXISTS "Admins can delete music" ON storage.objects;
CREATE POLICY "Admins can delete music"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'music');
