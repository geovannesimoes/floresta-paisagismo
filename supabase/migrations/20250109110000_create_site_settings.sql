CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'Floresta Paisagismo',
    logo_url TEXT,
    hero_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default row if not exists
INSERT INTO public.site_settings (id, logo_url, hero_image_url)
SELECT 
    '00000000-0000-0000-0000-000000000001', 
    NULL, 
    NULL
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to site_settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to update site_settings"
ON public.site_settings FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert site_settings"
ON public.site_settings FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Bucket for site assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Site Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'site-assets' );

CREATE POLICY "Authenticated Upload Site Assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-assets' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Update Site Assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-assets' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Delete Site Assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-assets' AND
  auth.role() = 'authenticated'
);
