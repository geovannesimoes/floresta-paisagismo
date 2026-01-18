-- Create email_outbox table
CREATE TABLE IF NOT EXISTS public.email_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    event_type TEXT NOT NULL,
    to_emails TEXT[] NOT NULL,
    subject TEXT NOT NULL,
    html TEXT,
    status TEXT DEFAULT 'queued' NOT NULL, -- queued, sent, failed
    provider_message_id TEXT,
    error TEXT,
    related_order_id UUID,
    related_user_id UUID
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed admin_notification_emails if not exists
INSERT INTO public.notification_settings (key, value)
VALUES ('admin_notification_emails', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS Policies

-- Enable RLS
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Email Outbox: Service Role can do everything
CREATE POLICY "Service role full access email_outbox" ON public.email_outbox
    FOR ALL USING (auth.role() = 'service_role');

-- Email Outbox: Admins can view logs
CREATE POLICY "Admins can view email_outbox" ON public.email_outbox
    FOR SELECT USING (auth.email() LIKE '%@viveirofloresta.com');

-- Notification Settings: Service Role full access
CREATE POLICY "Service role full access notification_settings" ON public.notification_settings
    FOR ALL USING (auth.role() = 'service_role');

-- Notification Settings: Admins full access
CREATE POLICY "Admins full access notification_settings" ON public.notification_settings
    FOR ALL USING (auth.email() LIKE '%@viveirofloresta.com');

-- Trigger function for updated_at if not exists (assuming generic one exists, if not create specific)
CREATE OR REPLACE FUNCTION public.update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON public.notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON public.notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notification_settings_updated_at();
