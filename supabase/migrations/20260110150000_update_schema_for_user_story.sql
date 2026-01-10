-- 1. Add cta_background_image_url to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS cta_background_image_url TEXT;

-- 2. Seed QA User (geovanne_simoes@hotmail.com / teste)
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

-- 3. Allow authenticated users to view their own orders based on email match
-- This is required for the QA flow where the user logs in via Auth
CREATE POLICY "Users can view own orders" 
ON public.orders 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  lower(client_email) = lower(auth.email())
);

