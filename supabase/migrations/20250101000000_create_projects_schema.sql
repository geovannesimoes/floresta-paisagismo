-- Enable pgcrypto for password hashing if not enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    is_featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'Em Andamento',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project_media table
CREATE TABLE IF NOT EXISTS public.project_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('before', 'after', 'gallery')),
    description TEXT,
    plants_used TEXT,
    materials_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Public read access
CREATE POLICY "Enable read access for all users" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.project_media FOR SELECT USING (true);

-- Admin write access (authenticated users)
CREATE POLICY "Enable insert for authenticated users only" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.projects FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON public.project_media FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.project_media FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.project_media FOR DELETE USING (auth.role() = 'authenticated');

-- Seed Admin User (Note: Using a fixed UUID for idempotency in this context)
-- Password is 'flamengo20102'
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'authenticated',
    'authenticated',
    'geovanne@viveirofloresta.com',
    crypt('flamengo20102', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Also handle email conflict if ID is different (cleanup old if exists)
DELETE FROM auth.users WHERE email = 'geovanne@viveirofloresta.com' AND id != 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Insert sample projects
INSERT INTO public.projects (title, description, is_featured, status) 
VALUES 
('Oásis Urbano', 'Transformação completa de um pequeno quintal cimentado em um refúgio tropical com deck de madeira.', true, 'Concluído'),
('Frente Moderna', 'Valorização da fachada com paisagismo minimalista e iluminação estratégica.', true, 'Concluído'),
('Varanda Gourmet', 'Integração da área de churrasqueira com jardim vertical e vasos ornamentais.', true, 'Concluído');
