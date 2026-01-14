-- Create order_checklist_items table
CREATE TABLE IF NOT EXISTS public.order_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_done BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add new columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_deadline_days INTEGER;

-- Enable RLS for order_checklist_items
ALTER TABLE public.order_checklist_items ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (Admins)
CREATE POLICY "Admins can do everything on checklist items"
    ON public.order_checklist_items
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
