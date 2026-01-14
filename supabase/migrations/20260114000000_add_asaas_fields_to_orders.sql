ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS asaas_checkout_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS asaas_checkout_url text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS asaas_status text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_asaas_checkout_id ON public.orders(asaas_checkout_id);
