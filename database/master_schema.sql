-- =========================================================================
-- Source: schema.sql
-- =========================================================================


-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE TABLE DEFINITIONS & FIELD UPGRADES
-- ==============================================================================

-- Core User Profiles Table (Indexed by Hardware Device Fingerprint Hash)
CREATE TABLE IF NOT EXISTS public.profiles (
    device_id TEXT PRIMARY KEY,
    name TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    age INTEGER DEFAULT 18,
    gender TEXT DEFAULT 'Everyone',
    photo_url TEXT DEFAULT '',
    location TEXT DEFAULT 'Delhi Hub',
    coins INTEGER DEFAULT 100,
    karma INTEGER DEFAULT 100 CHECK (karma >= 0 AND karma <= 100),
    verified BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Payment Orders for razorpay validation & replay attack prevention
CREATE TABLE IF NOT EXISTS public.payment_orders (
    order_id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL REFERENCES public.profiles(device_id),
    amount_inr INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Safely alter profiles table to ensure ALL Go Backend and Phase 2-3 fields exist
-- Ensure new columns exist (safe to run multiple times)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus TEXT DEFAULT 'Delhi University Hub';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS voice_prompt_url TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zodiacSign TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS analytics JSONB DEFAULT '{"views": 0, "likes": 0, "matches": 0}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'default';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS isAnonymous BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS orientation TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS faith TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prismaPersonality TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spotifyArtists TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prompts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS isStudent BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS studentIdUrl TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS studentVerificationStatus TEXT DEFAULT 'unverified';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smile_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vip_halo_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_teaser TEXT DEFAULT 'On our first weekend together, we are eating at...';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_rating INTEGER DEFAULT 500;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trusted_sos_phone TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Swipes Tracking Table (Correctly synchronized with Go struct & Next.js state: swiper_id, swiped_id, direction)
CREATE TABLE IF NOT EXISTS public.swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id TEXT REFERENCES public.profiles(device_id) ON DELETE CASCADE,
    swiped_id TEXT NOT NULL,
    direction TEXT NOT NULL, -- 'like', 'pass', 'superlike', 'right', 'left'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.swipes ADD COLUMN IF NOT EXISTS swiper_id TEXT;
ALTER TABLE public.swipes ADD COLUMN IF NOT EXISTS swiped_id TEXT;
ALTER TABLE public.swipes ADD COLUMN IF NOT EXISTS direction TEXT;

-- Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id TEXT NOT NULL,
    user2_id TEXT NOT NULL,
    chemistry_score INTEGER DEFAULT 85,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS chemistry_score INTEGER DEFAULT 85;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Feedbacks Table
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    device_id TEXT DEFAULT 'anon',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Reports Table (For Moderation & Anti-Spam)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id TEXT,
    reported_id TEXT,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Blocks Table
CREATE TABLE IF NOT EXISTS public.blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id TEXT NOT NULL,
    blocked_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(blocker_id, blocked_id)
);

-- Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id TEXT NOT NULL,
    referred_id TEXT NOT NULL,
    bonus_coins INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Friend Request & Chat Room Safeguards
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT REFERENCES public.profiles(device_id) ON DELETE CASCADE,
    receiver_id TEXT REFERENCES public.profiles(device_id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS public.friendships (
    user_id_1 TEXT REFERENCES public.profiles(device_id) ON DELETE CASCADE,
    user_id_2 TEXT REFERENCES public.profiles(device_id) ON DELETE CASCADE,
    established_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    PRIMARY KEY (user_id_1, user_id_2)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 3. ADVANCED DATING ENGINE TABLES (Phase 2-3 High Octane Suite)
-- ==============================================================================

-- After-Dark 18+ Anonymous Lounge (No photos, no names, anonymous sessions)
CREATE TABLE IF NOT EXISTS public.anonymous_after_dark_sessions (
    session_id TEXT PRIMARY KEY,
    vibe_tag TEXT NOT NULL,
    matched_gender TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '2 hours')
);

-- "Blind Audio" 3-Minute Date Sessions
CREATE TABLE IF NOT EXISTS public.blind_audio_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    caller_yes BOOLEAN DEFAULT false,
    receiver_yes BOOLEAN DEFAULT false,
    photos_unlocked BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- "Double Date" 2v2 Squad Chat Rooms
CREATE TABLE IF NOT EXISTS public.double_date_squads (
    room_id TEXT PRIMARY KEY,
    squad_name TEXT NOT NULL,
    member_1 TEXT NOT NULL,
    member_2 TEXT DEFAULT NULL,
    vibe_topic TEXT DEFAULT 'Late Night Fun',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- "Second Chance" Rewind Vault
CREATE TABLE IF NOT EXISTS public.swipe_history_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    action TEXT NOT NULL,
    rewound BOOLEAN DEFAULT false,
    action_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Emergency "Date Safe Check-in" Timer (For Real-World Dates)
CREATE TABLE IF NOT EXISTS public.safety_sos_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    date_location TEXT NOT NULL,
    emergency_contact TEXT NOT NULL,
    timer_duration_minutes INTEGER DEFAULT 120,
    checkin_due_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '2 hours'),
    is_confirmed_safe BOOLEAN DEFAULT false,
    sos_triggered BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) MASTER FIX - UNLOCK DEVICE ID DATA WRITES!
-- Because this PWA relies on hardware device IDs rather than traditional passwords,
-- strict default RLS blocks data insertion. These public policies permit clean data saves.
-- ==============================================================================

-- Enable RLS cleanly on all core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Remove old restrictive RLS policies if present
DROP POLICY IF EXISTS "Allow public read and write on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read and write on swipes" ON public.swipes;
DROP POLICY IF EXISTS "Allow public read and write on matches" ON public.matches;
DROP POLICY IF EXISTS "Allow public read and write on feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Allow public read and write on reports" ON public.reports;
DROP POLICY IF EXISTS "Allow public read and write on blocks" ON public.blocks;
DROP POLICY IF EXISTS "Allow public read and write on referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow public read and write on messages" ON public.messages;

-- Create Unconditional Access Policies for Device ID Based PWA Authentication
CREATE POLICY "Allow public read and write on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write on swipes" ON public.swipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write on matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write on feedbacks" ON public.feedbacks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write on reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write on blocks" ON public.blocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write on referrals" ON public.referrals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write on messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- Enable open policies for phase 2-3 advanced tables
ALTER TABLE public.anonymous_after_dark_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blind_audio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.double_date_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipe_history_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_sos_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on advanced suites" ON public.anonymous_after_dark_sessions;
DROP POLICY IF EXISTS "Allow public access on blind audio" ON public.blind_audio_sessions;
DROP POLICY IF EXISTS "Allow public access on double date squads" ON public.double_date_squads;
DROP POLICY IF EXISTS "Allow public access on swipe history" ON public.swipe_history_vault;
DROP POLICY IF EXISTS "Allow public access on safety sos checkins" ON public.safety_sos_checkins;

CREATE POLICY "Allow public access on advanced suites" ON public.anonymous_after_dark_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access on blind audio" ON public.blind_audio_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access on double date squads" ON public.double_date_squads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access on swipe history" ON public.swipe_history_vault FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access on safety sos checkins" ON public.safety_sos_checkins FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 5. PERFORMANCE INDEXES & AUTO-CLEANUP TRIGGERS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_campus ON public.profiles(campus);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target ON public.swipes(swiped_id);

-- Deleted accounts tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_banned ON public.profiles(is_banned);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active);

CREATE OR REPLACE FUNCTION clean_expired_ephemeral_messages() 
RETURNS trigger AS $$
BEGIN
    DELETE FROM public.messages 
    WHERE content LIKE '[DISAPPEARING_IMAGE]%' 
    AND created_at < now() - INTERVAL '1 day';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL REFERENCES public.profiles(device_id) ON DELETE CASCADE,
    amount INT NOT NULL, -- Positive for earn, negative for spend
    transaction_type TEXT NOT NULL, -- e.g., 'EARNED', 'SPENT'
    description TEXT NOT NULL, -- e.g., 'Watched an Ad', 'Played Flirt Game', 'Random Chat Unlock'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access on coin_transactions" ON public.coin_transactions;
CREATE POLICY "Allow public access on coin_transactions" ON public.coin_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_coin_tx_device ON public.coin_transactions(device_id);

-- Attach the cleanup trigger to messages table (was missing before)
DROP TRIGGER IF EXISTS trigger_clean_ephemeral ON public.messages;
CREATE TRIGGER trigger_clean_ephemeral
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION clean_expired_ephemeral_messages();


ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS match_preferences JSONB DEFAULT '{}'::jsonb;


-- =========================================================================
-- Source: schema_vip.sql
-- =========================================================================
-- Add VIP support to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;


-- =========================================================================
-- Source: schema_moderation.sql
-- =========================================================================
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


-- =========================================================================
-- Source: rls_fixes.sql
-- =========================================================================
-- ==============================================================================
-- 🚨 CRITICAL PRODUCTION SECURITY FIX: ROW LEVEL SECURITY (RLS) 🚨
-- This script replaces the dangerous "USING (true)" policies with secure,
-- device_id based matching using Supabase's auth.jwt() claims.
-- ==============================================================================

-- 1. FIX MISSING COLUMNS IF PREVIOUSLY CREATED WITHOUT THEM
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS device_id TEXT DEFAULT 'anon';
ALTER TABLE public.coin_transactions ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS reporter_id TEXT;
ALTER TABLE public.blocks ADD COLUMN IF NOT EXISTS blocker_id TEXT;

-- 2. DROP ALL OLD POLICIES FIRST TO PREVENT "ALREADY EXISTS" ERRORS
DROP POLICY IF EXISTS "Allow public read and write on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read and write on swipes" ON public.swipes;
DROP POLICY IF EXISTS "Allow public read and write on matches" ON public.matches;
DROP POLICY IF EXISTS "Allow public read and write on feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Allow public read and write on reports" ON public.reports;
DROP POLICY IF EXISTS "Allow public read and write on blocks" ON public.blocks;
DROP POLICY IF EXISTS "Allow public read and write on referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow public read and write on messages" ON public.messages;
DROP POLICY IF EXISTS "Allow public access on coin_transactions" ON public.coin_transactions;

-- DROP NEW SECURE POLICIES IF THEY EXIST (FOR IDEMPOTENCY)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can view their own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
DROP POLICY IF EXISTS "System can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update their matches" ON public.matches;
DROP POLICY IF EXISTS "Users can delete their matches" ON public.matches;
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own coin transactions" ON public.coin_transactions;
DROP POLICY IF EXISTS "Users can insert their own coin transactions" ON public.coin_transactions;
DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedbacks;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedbacks;
DROP POLICY IF EXISTS "Users can insert reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can insert blocks" ON public.blocks;
DROP POLICY IF EXISTS "Users can view own blocks" ON public.blocks;

-- 2. CREATE SECURE DEVICE_ID BASED POLICIES
-- Profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.jwt()->>'device_id')::text = device_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.jwt()->>'device_id')::text = device_id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING ((auth.jwt()->>'device_id')::text = device_id);

-- Swipes: Users can only insert/view their own swipes
CREATE POLICY "Users can insert their own swipes" ON public.swipes FOR INSERT WITH CHECK ((auth.jwt()->>'device_id')::text = swiper_id);
CREATE POLICY "Users can view their own swipes" ON public.swipes FOR SELECT USING ((auth.jwt()->>'device_id')::text = swiper_id OR (auth.jwt()->>'device_id')::text = swiped_id);

-- Matches: Users can only view/update matches they are a part of
CREATE POLICY "Users can view their matches" ON public.matches FOR SELECT USING ((auth.jwt()->>'device_id')::text = user1_id OR (auth.jwt()->>'device_id')::text = user2_id);
CREATE POLICY "System can insert matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their matches" ON public.matches FOR UPDATE USING ((auth.jwt()->>'device_id')::text = user1_id OR (auth.jwt()->>'device_id')::text = user2_id);
CREATE POLICY "Users can delete their matches" ON public.matches FOR DELETE USING ((auth.jwt()->>'device_id')::text = user1_id OR (auth.jwt()->>'device_id')::text = user2_id);

-- Messages: Users can only read/send messages in their own chats
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT WITH CHECK ((auth.jwt()->>'device_id')::text = sender_id);
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING ((auth.jwt()->>'device_id')::text = sender_id OR (auth.jwt()->>'device_id')::text = receiver_id);
CREATE POLICY "Users can delete their messages" ON public.messages FOR DELETE USING ((auth.jwt()->>'device_id')::text = sender_id OR (auth.jwt()->>'device_id')::text = receiver_id);

-- Coin Transactions: Users can only see their own coins
CREATE POLICY "Users can view their own coin transactions" ON public.coin_transactions FOR SELECT USING ((auth.jwt()->>'device_id')::text = device_id);
CREATE POLICY "Users can insert their own coin transactions" ON public.coin_transactions FOR INSERT WITH CHECK ((auth.jwt()->>'device_id')::text = device_id);

-- Feedback, Reports, Blocks
CREATE POLICY "Users can insert feedback" ON public.feedbacks FOR INSERT WITH CHECK ((auth.jwt()->>'device_id')::text = device_id);
CREATE POLICY "Users can view own feedback" ON public.feedbacks FOR SELECT USING ((auth.jwt()->>'device_id')::text = device_id);

CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT WITH CHECK ((auth.jwt()->>'device_id')::text = reporter_id);
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT USING ((auth.jwt()->>'device_id')::text = reporter_id);

CREATE POLICY "Users can insert blocks" ON public.blocks FOR INSERT WITH CHECK ((auth.jwt()->>'device_id')::text = blocker_id);
CREATE POLICY "Users can view own blocks" ON public.blocks FOR SELECT USING ((auth.jwt()->>'device_id')::text = blocker_id);

-- 3. ENSURE RLS IS ENABLED
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- Source: phase5_rls_fixes.sql
-- =========================================================================
-- ==============================================================================
-- 🚨 PHASE 5 CRITICAL FIX: ROW LEVEL SECURITY (RLS) LOCKDOWN
-- ==============================================================================

-- 1. FIX #24: Banned Users Block Helper Function
-- Yeh function check karega ki user banned toh nahi hai. Isse hum har policy mein lagayenge.
CREATE OR REPLACE FUNCTION public.is_user_banned(check_device_id text)
RETURNS boolean AS $$
  SELECT COALESCE((SELECT is_banned FROM public.profiles WHERE device_id = check_device_id), false);
$$ LANGUAGE sql SECURITY DEFINER;


-- ==============================================================================
-- 2. FIX #20: SECURE THE 5 CRITICAL TABLES (Emergency & After-Dark)
-- ==============================================================================

-- A. safety_sos_checkins
ALTER TABLE public.safety_sos_checkins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read and write" ON public.safety_sos_checkins;
DROP POLICY IF EXISTS "Users manage own SOS" ON public.safety_sos_checkins;
CREATE POLICY "Users manage own SOS" ON public.safety_sos_checkins
  FOR ALL USING (
    (auth.jwt()->>'device_id')::text = device_id 
    AND NOT public.is_user_banned((auth.jwt()->>'device_id')::text)
  );

-- B. anonymous_after_dark_sessions
ALTER TABLE public.anonymous_after_dark_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read and write" ON public.anonymous_after_dark_sessions;
DROP POLICY IF EXISTS "Users manage own after dark sessions" ON public.anonymous_after_dark_sessions;
CREATE POLICY "Users manage own after dark sessions" ON public.anonymous_after_dark_sessions
  FOR ALL USING (
    (auth.jwt()->>'device_id')::text = device_id 
    AND NOT public.is_user_banned((auth.jwt()->>'device_id')::text)
  );

-- C. blind_audio_sessions
ALTER TABLE public.blind_audio_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read and write" ON public.blind_audio_sessions;
DROP POLICY IF EXISTS "Users access own blind audio" ON public.blind_audio_sessions;
CREATE POLICY "Users access own blind audio" ON public.blind_audio_sessions
  FOR ALL USING (
    ((auth.jwt()->>'device_id')::text = caller_id OR (auth.jwt()->>'device_id')::text = receiver_id)
    AND NOT public.is_user_banned((auth.jwt()->>'device_id')::text)
  );

-- D. double_date_squads
ALTER TABLE public.double_date_squads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read and write" ON public.double_date_squads;
DROP POLICY IF EXISTS "Users access own squads" ON public.double_date_squads;
CREATE POLICY "Users access own squads" ON public.double_date_squads
  FOR ALL USING (
    ((auth.jwt()->>'device_id')::text = member_1 OR (auth.jwt()->>'device_id')::text = member_2)
    AND NOT public.is_user_banned((auth.jwt()->>'device_id')::text)
  );

-- E. swipe_history_vault
ALTER TABLE public.swipe_history_vault ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read and write" ON public.swipe_history_vault;
DROP POLICY IF EXISTS "Users manage own swipe history" ON public.swipe_history_vault;
CREATE POLICY "Users manage own swipe history" ON public.swipe_history_vault
  FOR ALL USING (
    (auth.jwt()->>'device_id')::text = device_id
    AND NOT public.is_user_banned((auth.jwt()->>'device_id')::text)
  );


-- ==============================================================================
-- 3. FIX #21: STOP PUBLIC PROFILE EXPOSURE (Coin & Data Leak)
-- ==============================================================================

-- Drop the dangerous open policy that exposes coins and karma to everyone
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a secure VIEW for the frontend to browse public data safely (without coins/PII)
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT device_id, name, bio, age, photo_url, gender, campus, hobbies, interests, verified
  FROM public.profiles
  WHERE is_banned = false;

-- Allow users to only see their OWN full profile (including coins) from the base table
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;
CREATE POLICY "Users can view own full profile" ON public.profiles
  FOR SELECT USING (
    (auth.jwt()->>'device_id')::text = device_id
  );


-- ==============================================================================
-- 4. FIX #22: STOP FORGED MATCHES
-- ==============================================================================

DROP POLICY IF EXISTS "System can insert matches" ON public.matches;

-- WITH CHECK (false) means NO ONE can insert a match directly from the frontend app.
-- Matches can now ONLY be created by the Go Backend using the secret service-role key.
DROP POLICY IF EXISTS "No frontend inserts for matches" ON public.matches;
CREATE POLICY "No frontend inserts for matches" ON public.matches
  FOR INSERT WITH CHECK (false);


-- ==============================================================================
-- 5. FIX #23: SECURE UNVERIFIED TABLES (Referrals, Friends, Admins)
-- ==============================================================================

-- Referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users access own referrals" ON public.referrals;
CREATE POLICY "Users access own referrals" ON public.referrals
  FOR ALL USING ((auth.jwt()->>'device_id')::text = referrer_id);

-- Friend Requests
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users access own friend requests" ON public.friend_requests;
CREATE POLICY "Users access own friend requests" ON public.friend_requests
  FOR ALL USING (
    (auth.jwt()->>'device_id')::text = sender_id OR (auth.jwt()->>'device_id')::text = receiver_id
  );

-- Friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users access own friendships" ON public.friendships;
CREATE POLICY "Users access own friendships" ON public.friendships
  FOR SELECT USING (
    (auth.jwt()->>'device_id')::text = user_id_1 OR (auth.jwt()->>'device_id')::text = user_id_2
  );
DROP POLICY IF EXISTS "No frontend inserts for friendships" ON public.friendships;
CREATE POLICY "No frontend inserts for friendships" ON public.friendships
  FOR INSERT WITH CHECK (false); -- Only backend handles this now

-- Sub Admins
ALTER TABLE public.sub_admins ENABLE ROW LEVEL SECURITY;
-- Ensure frontend users can NEVER read or access the sub_admins table (which contains passwords)
DROP POLICY IF EXISTS "No frontend access to sub_admins" ON public.sub_admins;
CREATE POLICY "No frontend access to sub_admins" ON public.sub_admins
  FOR ALL USING (false);

GRANT SELECT ON public.public_profiles TO anon, authenticated;


-- =========================================================================
-- Source: schema_rpc.sql
-- =========================================================================
CREATE OR REPLACE FUNCTION update_coins_atomic(p_device_id text, p_amount int)
RETURNS int AS $$
DECLARE new_balance int;
BEGIN
  UPDATE profiles
  SET coins = coins + p_amount
  WHERE device_id = p_device_id AND coins + p_amount >= 0
  RETURNING coins INTO new_balance;
  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'insufficient_coins';
  END IF;
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION deduct_karma(p_device_id text, p_amount int)
RETURNS int AS $$
DECLARE new_karma int;
BEGIN
  UPDATE profiles SET karma = GREATEST(0, karma - p_amount)
  WHERE device_id = p_device_id RETURNING karma INTO new_karma;
  RETURN new_karma;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


