-- Add columns for improved Asaas tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS asaas_payment_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS asaas_webhook_last_event_at timestamptz;

-- Create index for faster lookup on webhooks
CREATE INDEX IF NOT EXISTS idx_orders_asaas_payment_id ON public.orders(asaas_payment_id);
