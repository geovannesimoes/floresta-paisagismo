-- Ensure all required columns exist in the orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS client_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS client_email TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS client_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS property_type TEXT,
ADD COLUMN IF NOT EXISTS dimensions TEXT,
ADD COLUMN IF NOT EXISTS preferences TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS price NUMERIC,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Aguardando Pagamento',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT,
ADD COLUMN IF NOT EXISTS asaas_payment_id TEXT,
ADD COLUMN IF NOT EXISTS asaas_invoice_url TEXT,
ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'asaas';

-- Ensure ID is text (if not already)
-- This was likely handled in previous migrations but ensuring here for consistency with alphanumeric IDs
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'id'
        AND data_type = 'uuid'
    ) THEN
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
    END IF;
END $$;
