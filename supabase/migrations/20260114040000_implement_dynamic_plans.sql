-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  highlight BOOLEAN DEFAULT false,
  cta TEXT DEFAULT 'Escolher',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create plan_features table
CREATE TABLE IF NOT EXISTS public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add snapshot columns to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id),
ADD COLUMN IF NOT EXISTS plan_snapshot_name TEXT,
ADD COLUMN IF NOT EXISTS plan_snapshot_price_cents INTEGER,
ADD COLUMN IF NOT EXISTS plan_snapshot_features JSONB;

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plans
DROP POLICY IF EXISTS "Allow public read on active plans" ON public.plans;
CREATE POLICY "Allow public read on active plans" ON public.plans FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin all on plans" ON public.plans;
CREATE POLICY "Allow admin all on plans" ON public.plans FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for plan_features
DROP POLICY IF EXISTS "Allow public read on plan features" ON public.plan_features;
CREATE POLICY "Allow public read on plan features" ON public.plan_features FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.plans WHERE id = plan_features.plan_id AND (is_active = true OR auth.role() = 'authenticated'))
);

DROP POLICY IF EXISTS "Allow admin all on plan features" ON public.plan_features;
CREATE POLICY "Allow admin all on plan features" ON public.plan_features FOR ALL USING (auth.role() = 'authenticated');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_plans_updated_at ON public.plans;
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_plan_features_updated_at ON public.plan_features;
CREATE TRIGGER update_plan_features_updated_at BEFORE UPDATE ON public.plan_features FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Seed Data (Idempotent)
DO $$
DECLARE
  lirio_id UUID;
  ipe_id UUID;
  jasmim_id UUID;
BEGIN
  -- Insert or Update Lírio
  INSERT INTO public.plans (slug, name, description, price_cents, sort_order, highlight, cta) 
  VALUES ('lirio', 'Lírio', 'Ideal para pequenas renovações e consultas rápidas.', 39900, 1, false, 'Escolher Lírio')
  ON CONFLICT (slug) DO UPDATE SET price_cents = 39900
  RETURNING id INTO lirio_id;
  
  -- Insert or Update Ipê
  INSERT INTO public.plans (slug, name, description, price_cents, sort_order, highlight, cta) 
  VALUES ('ipe', 'Ipê', 'O equilíbrio perfeito para transformar seu espaço.', 69900, 2, true, 'Escolher Ipê')
  ON CONFLICT (slug) DO UPDATE SET price_cents = 69900
  RETURNING id INTO ipe_id;
  
  -- Insert or Update Jasmim
  INSERT INTO public.plans (slug, name, description, price_cents, sort_order, highlight, cta) 
  VALUES ('jasmim', 'Jasmim', 'Experiência premium e suporte dedicado.', 99900, 3, false, 'Escolher Jasmim')
  ON CONFLICT (slug) DO UPDATE SET price_cents = 99900
  RETURNING id INTO jasmim_id;

  -- Clear existing features to re-seed cleanly
  DELETE FROM public.plan_features WHERE plan_id IN (lirio_id, ipe_id, jasmim_id);

  -- Seed features
  INSERT INTO public.plan_features (plan_id, text, sort_order) VALUES
  (lirio_id, 'Análise detalhada das fotos', 1),
  (lirio_id, 'Design paisagístico conceitual', 2),
  (lirio_id, 'Sugestão de plantas ideais', 3),
  (lirio_id, '1 versão do projeto', 4),
  (lirio_id, 'Entrega em PDF digital', 5),
  (lirio_id, 'Prazo: até 7 dias úteis', 6),
  
  (ipe_id, 'Tudo do Projeto Lírio', 1),
  (ipe_id, 'Lista de compras completa', 2),
  (ipe_id, '1 rodada de revisão', 3),
  (ipe_id, 'Guia de manutenção básico', 4),
  (ipe_id, 'Entrega em alta resolução', 5),
  (ipe_id, 'Prazo: até 7 dias úteis', 6),

  (jasmim_id, 'Tudo do Projeto Ipê', 1),
  (jasmim_id, '2 rodadas de revisão', 2),
  (jasmim_id, 'Suporte via WhatsApp', 3),
  (jasmim_id, 'Guia detalhado de plantio', 4),
  (jasmim_id, 'Prioridade na entrega', 5),
  (jasmim_id, 'Prazo: até 3 dias úteis', 6);
END $$;

-- Update create_order_and_return RPC to accept snapshot fields
DROP FUNCTION IF EXISTS create_order_and_return(text, text, text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION create_order_and_return(
  p_client_name text,
  p_client_email text,
  p_client_cpf_cnpj text,
  p_client_whatsapp text,
  p_property_type text,
  p_dimensions text,
  p_preferences text,
  p_notes text,
  p_plan text,
  p_plan_id uuid DEFAULT NULL,
  p_plan_snapshot_name text DEFAULT NULL,
  p_plan_snapshot_price_cents integer DEFAULT NULL,
  p_plan_snapshot_features jsonb DEFAULT NULL
)
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  new_code text;
  order_result orders%ROWTYPE;
BEGIN
  LOOP
    new_code := upper(substring(md5(gen_random_uuid()::text || clock_timestamp()::text) from 1 for 8));
    BEGIN
      INSERT INTO orders (
        client_name, client_email, client_cpf_cnpj, client_whatsapp,
        property_type, dimensions, preferences, notes, plan,
        plan_id, plan_snapshot_name, plan_snapshot_price_cents, plan_snapshot_features,
        code, status, created_at, updated_at
      ) VALUES (
        p_client_name, p_client_email, p_client_cpf_cnpj, p_client_whatsapp,
        p_property_type, p_dimensions, p_preferences, p_notes, p_plan,
        p_plan_id, p_plan_snapshot_name, p_plan_snapshot_price_cents, p_plan_snapshot_features,
        new_code, 'Aguardando Pagamento', now(), now()
      )
      RETURNING * INTO order_result;
      RETURN NEXT order_result;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      CONTINUE;
    END;
  END LOOP;
END;
$func$;

GRANT EXECUTE ON FUNCTION create_order_and_return(text, text, text, text, text, text, text, text, text, uuid, text, integer, jsonb) TO anon, authenticated, service_role;
