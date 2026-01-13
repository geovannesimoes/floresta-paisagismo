-- Fix backfill of codes: Update existing orders that have UUID-like codes (longer than 8 chars)
-- Generate a random 8-character alphanumeric code for them
UPDATE public.orders 
SET code = upper(substring(md5(id::text || clock_timestamp()::text) from 1 for 8))
WHERE length(code) > 8;

-- Standardize QA User Order
-- Ensure the specific QA test user has the code 'TESTE123'
UPDATE public.orders 
SET code = 'TESTE123' 
WHERE client_email = 'geovanne_simoes@hotmail.com';

-- Ensure unique index exists on code to prevent duplicates
DROP INDEX IF EXISTS orders_code_key;
CREATE UNIQUE INDEX orders_code_key ON public.orders(code);

-- Verify the get_client_order function handles the code lookup correctly
CREATE OR REPLACE FUNCTION get_client_order(p_email text, p_code text)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM orders
  WHERE lower(client_email) = lower(p_email)
  AND code = p_code;
$$;
