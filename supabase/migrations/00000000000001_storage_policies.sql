-- =============================================================================
-- CLIPFORGE: STORAGE RLS POLICIES FOR 'videos' BUCKET
-- =============================================================================

-- Ensure the bucket is private (if not already done via UI)
UPDATE storage.buckets SET public = false WHERE id = 'videos';

-- 1. Users can upload to their own folder: userId/projectId/...
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Users can view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT 
TO authenticated
USING (
    bucket_id = 'videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE 
TO authenticated
USING (
    bucket_id = 'videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE 
TO authenticated
USING (
    bucket_id = 'videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);