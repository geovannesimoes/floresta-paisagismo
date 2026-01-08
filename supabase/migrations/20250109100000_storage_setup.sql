-- Create a storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the storage bucket

-- Allow public read access to all objects in the 'project-images' bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'project-images' );

-- Allow authenticated users to upload objects to the 'project-images' bucket
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update objects in the 'project-images' bucket
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete objects in the 'project-images' bucket
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-images' AND
  auth.role() = 'authenticated'
);
