-- Fix backfill of codes: Update existing orders that have UUID-like codes (longer than 8 chars)
-- Generate a random 8-character alphanumeric code for them
UPDATE public.orders 
SET code = upper(substring(md5(id::text || clock_timestamp()::text) from 1 for 8))
WHERE length(code) > 8;

-- Pre-emptive cleanup: ensure 'TESTE123' is not currently in use by any order
-- This prevents unique constraint violations when we assign it to the QA user
-- If the QA user already has it on an order, it will be reset here but re-assigned below (if it's the latest one), which is fine
UPDATE public.orders
SET code = upper(substring(md5(id::text || clock_timestamp()::text) from 1 for 8))
WHERE code = 'TESTE123';

-- Standardize QA User Order
-- Ensure the specific QA test user has the code 'TESTE123'
-- We target ONLY the most recent order for this email to avoid creating duplicates if the user has multiple orders
WITH target_order AS (
  SELECT id 
  FROM public.orders 
  WHERE client_email = 'geovanne_simoes@hotmail.com' 
  ORDER BY created_at DESC 
  LIMIT 1
)
UPDATE public.orders 
SET code = 'TESTE123' 
WHERE id IN (SELECT id FROM target_order);

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
