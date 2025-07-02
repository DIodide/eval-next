-- RLS Policies for Storage Buckets
-- To only be run manually on the Supabase GUI
-- These policies allow anonymous access for file uploads/management
-- This is designed for apps using Clerk authentication with Supabase storage

-- Drop existing policies if they exist (optional - remove if policies don't exist yet)
DROP POLICY IF EXISTS "league-assets_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "league-assets_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "league-assets_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "league-assets_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "tryout-assets_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "tryout-assets_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "tryout-assets_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "tryout-assets_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "school-assets_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "school-assets_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "school-assets_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "school-assets_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "player-assets_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "player-assets_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "player-assets_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "player-assets_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "coach-assets_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "coach-assets_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "coach-assets_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "coach-assets_delete_policy" ON storage.objects;

-- League Assets Policies
-- Allow public read access to league-assets bucket
CREATE POLICY "league-assets_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'league-assets');

-- Allow anonymous users to upload to league-assets bucket
CREATE POLICY "league-assets_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'league-assets');

-- Allow anonymous users to update files in league-assets bucket
CREATE POLICY "league-assets_update_policy" ON storage.objects
FOR UPDATE USING (bucket_id = 'league-assets');

-- Allow anonymous users to delete files in league-assets bucket
CREATE POLICY "league-assets_delete_policy" ON storage.objects
FOR DELETE USING (bucket_id = 'league-assets');

-- Tryout Assets Policies
-- Allow public read access to tryout-assets bucket
CREATE POLICY "tryout-assets_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'tryout-assets');

-- Allow anonymous users to upload to tryout-assets bucket
CREATE POLICY "tryout-assets_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'tryout-assets');

-- Allow anonymous users to update files in tryout-assets bucket
CREATE POLICY "tryout-assets_update_policy" ON storage.objects
FOR UPDATE USING (bucket_id = 'tryout-assets');

-- Allow anonymous users to delete files in tryout-assets bucket
CREATE POLICY "tryout-assets_delete_policy" ON storage.objects
FOR DELETE USING (bucket_id = 'tryout-assets');

-- School Assets Policies
-- Allow public read access to school-assets bucket
CREATE POLICY "school-assets_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'school-assets');

-- Allow anonymous users to upload to school-assets bucket
CREATE POLICY "school-assets_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'school-assets');

-- Allow anonymous users to update files in school-assets bucket
CREATE POLICY "school-assets_update_policy" ON storage.objects
FOR UPDATE USING (bucket_id = 'school-assets');

-- Allow anonymous users to delete files in school-assets bucket
CREATE POLICY "school-assets_delete_policy" ON storage.objects
FOR DELETE USING (bucket_id = 'school-assets');

-- Player Assets Policies
-- Allow public read access to player-assets bucket
CREATE POLICY "player-assets_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'player-assets');

-- Allow anonymous users to upload to player-assets bucket
CREATE POLICY "player-assets_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'player-assets');

-- Allow anonymous users to update files in player-assets bucket
CREATE POLICY "player-assets_update_policy" ON storage.objects
FOR UPDATE USING (bucket_id = 'player-assets');

-- Allow anonymous users to delete files in player-assets bucket
CREATE POLICY "player-assets_delete_policy" ON storage.objects
FOR DELETE USING (bucket_id = 'player-assets');

-- Coach Assets Policies
-- Allow public read access to coach-assets bucket
CREATE POLICY "coach-assets_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'coach-assets');

-- Allow anonymous users to upload to coach-assets bucket
CREATE POLICY "coach-assets_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'coach-assets');

-- Allow anonymous users to update files in coach-assets bucket
CREATE POLICY "coach-assets_update_policy" ON storage.objects
FOR UPDATE USING (bucket_id = 'coach-assets');

-- Allow anonymous users to delete files in coach-assets bucket
CREATE POLICY "coach-assets_delete_policy" ON storage.objects
FOR DELETE USING (bucket_id = 'coach-assets'); 