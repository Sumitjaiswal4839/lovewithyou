-- 1. Create Admin Users Table (For Sub-Admins with Roles)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'moderator', -- 'master', 'moderator', etc.
    permissions JSONB NOT NULL DEFAULT '{"can_view_users": true, "can_ban_users": true, "can_manage_payments": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: In production, the Master Admin should also be added here if you want to stop using .env completely.
-- For now, this table is mainly used to create Sub-Admins from the Admin Panel.

-- 2. Create Site Settings Table (For Dynamic Maintenance Mode & Config)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Feature Flags (Dynamic Maintenance Mode)
INSERT INTO public.site_settings (setting_key, setting_value, description)
VALUES (
    'maintenance_flags',
    '{
        "email_auth": false,
        "payments": false,
        "random_chat": false,
        "campus_mode": false,
        "matching": false,
        "blind_date": false,
        "midnight_roulette": false,
        "map_radar": false,
        "cupid_slot": false,
        "video_calls": false
    }'::jsonb,
    'Toggles to put specific features in maintenance mode.'
) ON CONFLICT (setting_key) DO NOTHING;

-- Insert General App Settings (Optional, for future use)
INSERT INTO public.site_settings (setting_key, setting_value, description)
VALUES (
    'app_config',
    '{"app_name": "LoveWithYou", "maintenance_message": "We are currently upgrading our systems. Please check back later!"}'::jsonb,
    'Global app configuration'
) ON CONFLICT (setting_key) DO NOTHING;
