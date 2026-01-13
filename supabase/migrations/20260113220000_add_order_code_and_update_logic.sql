-- Add code column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS code TEXT;

-- Update existing records: code = id for everyone first to populate column
UPDATE public.orders SET code = id WHERE code IS NULL;

-- Specifically fix QA user to have uppercase code 'TESTE' to match new normalization rules
UPDATE public.orders 
SET code = 'TESTE' 
WHERE client_email = 'geovanne_simoes@hotmail.com' AND (id = 'teste' OR id = 'TESTE');

-- Create unique index to ensure codes are unique
DROP INDEX IF EXISTS orders_code_key;
CREATE UNIQUE INDEX orders_code_key ON public.orders(code);

-- Make code NOT NULL now that it is populated
ALTER TABLE public.orders ALTER COLUMN code SET NOT NULL;

-- Set default for ID to allow UUID generation for NEW rows (cast to text to match column type)
ALTER TABLE public.orders ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Update get_client_order to use code instead of id
DROP FUNCTION IF EXISTS get_client_order(text, text);
CREATE OR REPLACE FUNCTION get_client_order(p_email text, p_code text)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM orders
  WHERE lower(client_email) = lower(p_email)
  AND code = p_code;
$$;
