-- Migration to add payment related fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS price numeric,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS asaas_customer_id text,
ADD COLUMN IF NOT EXISTS asaas_payment_id text,
ADD COLUMN IF NOT EXISTS asaas_invoice_url text,
ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_mode text DEFAULT 'asaas';

-- Function to get order by code (ID) securely without needing authentication (for success page)
CREATE OR REPLACE FUNCTION get_order_by_code(p_code text)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM orders WHERE id = p_code;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_order_by_code(text) TO anon, authenticated, service_role;
