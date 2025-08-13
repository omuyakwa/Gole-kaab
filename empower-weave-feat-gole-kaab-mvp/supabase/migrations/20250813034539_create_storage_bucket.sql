-- Create a new storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('user_uploads', 'user_uploads', false, 52428800, ARRAY['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- RLS POLICIES FOR 'user_uploads' BUCKET

-- 1. Allow users to view files in their own folder
CREATE POLICY "Allow users to view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user_uploads' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 2. Allow users to upload files into their own folder
CREATE POLICY "Allow users to upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user_uploads' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 3. Allow users to update their own files
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user_uploads' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 4. Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user_uploads' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);
