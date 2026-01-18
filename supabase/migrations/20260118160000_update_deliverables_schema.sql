DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_deliverables' AND column_name = 'type') THEN
        ALTER TABLE public.order_deliverables ADD COLUMN type TEXT;
    END IF;
END $$;
