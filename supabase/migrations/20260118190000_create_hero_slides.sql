CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    cta_text TEXT,
    cta_href TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public read access for active slides
CREATE POLICY "Public read active hero_slides" ON public.hero_slides
    FOR SELECT USING (is_active = true);

-- Admins have full access
CREATE POLICY "Admins full access hero_slides" ON public.hero_slides
    FOR ALL USING (auth.email() LIKE '%@viveirofloresta.com');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_hero_slides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hero_slides_updated_at
    BEFORE UPDATE ON public.hero_slides
    FOR EACH ROW
    EXECUTE FUNCTION public.update_hero_slides_updated_at();

-- Initial Seed (using the default static image logic from current code as reference)
INSERT INTO public.hero_slides (image_url, title, subtitle, cta_text, cta_href, sort_order)
VALUES (
    'https://img.usecurling.com/p/1920/1080?q=luxury%20tropical%20garden&dpr=2',
    'Seu refúgio particular começa com um bom projeto',
    'Paisagismo profissional, 100% online e acessível. Transformamos seu espaço em um ambiente vivo e acolhedor.',
    'Começar Transformação',
    '/planos',
    0
);
