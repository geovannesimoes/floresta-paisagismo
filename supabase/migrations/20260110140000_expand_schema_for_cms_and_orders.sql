-- Expand site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT 'Seu refúgio particular começa com um bom projeto',
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'Paisagismo profissional, 100% online e acessível. Transformamos seu espaço em um ambiente vivo e acolhedor.',
ADD COLUMN IF NOT EXISTS hero_button_text TEXT DEFAULT 'Começar Transformação',
ADD COLUMN IF NOT EXISTS hero_button_link TEXT DEFAULT '/planos',
ADD COLUMN IF NOT EXISTS cta_title TEXT DEFAULT 'Pronto para transformar seu espaço?',
ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT 'Não deixe para depois. Tenha o jardim dos seus sonhos com um projeto profissional, acessível e feito para você.',
ADD COLUMN IF NOT EXISTS cta_button_text TEXT DEFAULT 'Começar Agora',
ADD COLUMN IF NOT EXISTS cta_button_link TEXT DEFAULT '/planos',
ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '(64) 98453-6263',
ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT 'viveirofloresta@hotmail.com',
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'Rua Amapá, 539, Centro, Goiatuba, GO',
ADD COLUMN IF NOT EXISTS instagram_link TEXT DEFAULT 'https://instagram.com/viveirofloresta',
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#346a32',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#ffd700';

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_id SERIAL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_whatsapp TEXT,
    property_type TEXT,
    dimensions TEXT,
    preferences TEXT,
    notes TEXT,
    plan TEXT NOT NULL,
    status TEXT DEFAULT 'Aguardando Pagamento',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order_photos table
CREATE TABLE IF NOT EXISTS public.order_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order_deliverables table
CREATE TABLE IF NOT EXISTS public.order_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'file',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create revision_requests table
CREATE TABLE IF NOT EXISTS public.revision_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_requests ENABLE ROW LEVEL SECURITY;

-- Policies for Orders
CREATE POLICY "Admin full access orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Client create order" ON public.orders FOR INSERT WITH CHECK (true);
-- Clients read their own order via RPC/Function or direct ID match if we allowed it, but sticking to RPC for security
-- We allow SELECT for anon to support the 'get_client_order' logic if needed, or rely on SECURITY DEFINER function.
-- Let's rely on SECURITY DEFINER function for client access to Order details to prevent listing all orders.

-- Policies for related tables (allowing public SELECT to simplify client area if they know the UUID/Link, but insert restricted)
CREATE POLICY "Admin full access order_photos" ON public.order_photos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Client upload photos" ON public.order_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read photos" ON public.order_photos FOR SELECT USING (true);

CREATE POLICY "Admin full access order_deliverables" ON public.order_deliverables FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read deliverables" ON public.order_deliverables FOR SELECT USING (true);

CREATE POLICY "Admin full access revision_requests" ON public.revision_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Client insert revision" ON public.revision_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read revisions" ON public.revision_requests FOR SELECT USING (true);

-- RPC for Client Login
CREATE OR REPLACE FUNCTION get_client_order(p_email TEXT, p_id UUID)
RETURNS SETOF public.orders
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.orders WHERE LOWER(client_email) = LOWER(p_email) AND id = p_id;
$$;

GRANT EXECUTE ON FUNCTION get_client_order TO anon, authenticated;

-- Storage Bucket for Order Uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('order-uploads', 'order-uploads', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Order Uploads" ON storage.objects FOR SELECT USING (bucket_id = 'order-uploads');
CREATE POLICY "Public Insert Order Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'order-uploads');
CREATE POLICY "Auth Update Order Uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'order-uploads' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Order Uploads" ON storage.objects FOR DELETE USING (bucket_id = 'order-uploads' AND auth.role() = 'authenticated');

