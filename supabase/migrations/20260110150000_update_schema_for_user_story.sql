-- Convert ID columns to TEXT to support alphanumeric IDs
ALTER TABLE public.order_photos DROP CONSTRAINT IF EXISTS order_photos_order_id_fkey;
ALTER TABLE public.order_deliverables DROP CONSTRAINT IF EXISTS order_deliverables_order_id_fkey;
ALTER TABLE public.revision_requests DROP CONSTRAINT IF EXISTS revision_requests_order_id_fkey;

ALTER TABLE public.orders ALTER COLUMN id TYPE text;
ALTER TABLE public.order_photos ALTER COLUMN order_id TYPE text;
ALTER TABLE public.order_deliverables ALTER COLUMN order_id TYPE text;
ALTER TABLE public.revision_requests ALTER COLUMN order_id TYPE text;

ALTER TABLE public.order_photos ADD CONSTRAINT order_photos_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE public.order_deliverables ADD CONSTRAINT order_deliverables_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE public.revision_requests ADD CONSTRAINT revision_requests_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Ensure CTA background image column exists
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS cta_background_image_url TEXT;

-- Seed QA User if not exists
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
)
SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'geovanne_simoes@hotmail.com',
    crypt('teste', gen_salt('bf')),
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
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'geovanne_simoes@hotmail.com'
);

-- Seed QA Order
INSERT INTO public.orders (id, client_email, client_name, plan, status, created_at, updated_at, display_id)
VALUES (
    'teste',
    'geovanne_simoes@hotmail.com',
    'QA Test User',
    'Jasmim',
    'Recebido',
    now(),
    now(),
    999999
)
ON CONFLICT (id) DO NOTHING;

-- Policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  lower(client_email) = lower(auth.email())
);

-- Recreate function to support TEXT id if needed
DROP FUNCTION IF EXISTS get_client_order(text, text);
CREATE OR REPLACE FUNCTION get_client_order(p_email text, p_id text)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM orders
  WHERE lower(client_email) = lower(p_email)
  AND id = p_id;
$$;
