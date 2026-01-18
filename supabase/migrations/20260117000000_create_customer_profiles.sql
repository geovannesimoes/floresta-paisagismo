CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  cpf TEXT,
  whatsapp TEXT,
  must_change_password BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.customer_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.customer_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role to manage all profiles (needed for edge functions)
CREATE POLICY "Service role can manage all profiles" ON public.customer_profiles
  USING (true)
  WITH CHECK (true);
