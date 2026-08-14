-- 1. Reports Table (For Trust & Safety)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id TEXT NOT NULL,
    offender_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own reports" ON public.reports
    FOR INSERT WITH CHECK ((auth.jwt()->>'device_id')::text = reporter_id);
-- (Admin will bypass RLS using service_role key to view/edit reports)

-- 2. App Settings Table (For Maintenance Mode)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value BOOLEAN NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default maintenance mode state (Off)
INSERT INTO public.app_settings (key, value) VALUES ('maintenance_mode', false) ON CONFLICT DO NOTHING;

-- Anyone can read settings, but no frontend updates allowed
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read app settings" ON public.app_settings FOR SELECT USING (true);

-- 3. Admin Audit Logs (To track sub-admin actions)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id TEXT NOT NULL,
    action TEXT NOT NULL, -- e.g., 'BANNED_USER', 'GAVE_COINS'
    target_id TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Strictly locked down. Only backend service_role can write/read.
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
