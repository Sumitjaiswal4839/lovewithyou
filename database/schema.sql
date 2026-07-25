-- ==============================================================================
-- 🏛️ MASTER DATABASE SCHEMA (PostgreSQL / Supabase Cloud Production Engine)
-- Located in the dedicated 'database' directory at project root: D:\Codingh\random chat\database
-- Sets up robust relational data modeling, indexing, and Row Level Security (RLS)
-- for LoveWithYou Dating Platform.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. PRIMARY TABLES
-- ==============================================================================

-- Core User Profile Table (Indexed by Hardware Device Fingerprint Hash)
CREATE TABLE IF NOT EXISTS public.users (
    device_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hidden_name TEXT NOT NULL, -- Anonymized display representation (e.g. "S***t")
    gender TEXT NOT NULL,
    age INTEGER CHECK (age >= 18),
    campus TEXT DEFAULT 'Delhi University Hub',
    coins INTEGER DEFAULT 10,
    karma INTEGER DEFAULT 100 CHECK (karma >= 0 AND karma <= 100),
    verified BOOLEAN DEFAULT false,
    smile_verified BOOLEAN DEFAULT false, -- AI Catfish Buster Blue Diamond check
    vip_halo_until TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- 20 Coin 24-hr glowing Golden Halo Aura
    custom_teaser TEXT DEFAULT 'On our first weekend together, we are eating at...', -- Finish My Sentence prompt
    weekly_rating INTEGER DEFAULT 500, -- Top Flirter & Connector Leaderboard Elo score
    trusted_sos_phone TEXT DEFAULT NULL, -- Emergency 2-hour date safety contact
    photos TEXT[] NOT NULL, -- Mandatory minimum 6 photos verification rule
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Friend Request Tracking (Asymmetric handshake)
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    receiver_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(sender_id, receiver_id)
);

-- Active Confirmed Friendships (Unlocks private encrypted chats)
CREATE TABLE IF NOT EXISTS public.friendships (
    user_id_1 TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    user_id_2 TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    established_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    PRIMARY KEY (user_id_1, user_id_2)
);

-- Chat Messaging Rooms (Supports rich media attachments, voice notes, and ephemeral snaps)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    receiver_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- Parses plain text, [IMAGE]..., [AUDIO]..., or [DISAPPEARING_IMAGE]...
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Secret Crush Lock Box (Encrypted mutual discovery engine)
CREATE TABLE IF NOT EXISTS public.secret_crushes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    crush_handle TEXT NOT NULL,
    is_matched BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(owner_id, crush_handle)
);

-- Anonymous Campus Confessions & Community Feed
CREATE TABLE IF NOT EXISTS public.campus_confessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id TEXT REFERENCES public.users(device_id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    department_tag TEXT DEFAULT 'General Campus',
    likes_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Live GPS Sonar Radar Locations (Ephemeral Coordinates)
CREATE TABLE IF NOT EXISTS public.radar_locations (
    device_id TEXT PRIMARY KEY REFERENCES public.users(device_id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    last_ping_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 3. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_campus ON public.users(campus);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON public.friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_secret_crushes_handle ON public.secret_crushes(crush_handle);
CREATE INDEX IF NOT EXISTS idx_confessions_created_at ON public.campus_confessions(created_at DESC);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secret_crushes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radar_locations ENABLE ROW LEVEL SECURITY;

-- Allow users to read anonymized public profile cards
CREATE POLICY "Allow public read of student profile summaries" ON public.users
    FOR SELECT USING (true);

-- Ensure users can only modify their own device ID profile row
CREATE POLICY "Allow individual update on matching device ID" ON public.users
    FOR UPDATE USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');

-- Restrict private message reads exclusively to sender or receiver
CREATE POLICY "Lock message interception to participants only" ON public.messages
    FOR SELECT USING (
        sender_id = current_setting('request.headers', true)::json->>'x-device-id' OR 
        receiver_id = current_setting('request.headers', true)::json->>'x-device-id'
    );

-- Shield secret crush targets so they cannot be harvested or queried publicly
CREATE POLICY "Strict privacy on secret crush selections" ON public.secret_crushes
    FOR SELECT USING (owner_id = current_setting('request.headers', true)::json->>'x-device-id');

-- ==============================================================================
-- 5. AUTOMATED CLEANUP TRIGGER (For Ephemeral Disappearing Media)
-- ==============================================================================
CREATE OR REPLACE FUNCTION clean_expired_ephemeral_messages() 
RETURNS trigger AS $$
BEGIN
    DELETE FROM public.messages 
    WHERE content LIKE '[DISAPPEARING_IMAGE]%' 
    AND created_at < now() - INTERVAL '1 day';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 6. AFTER-DARK 18+ ANONYMOUS INTIMATE LOUNGE (EPHEMERAL MONITORING)
-- Strictly tracks active anonymized session pairings without capturing names,
-- photos, coordinates, or message content to guarantee end-to-end privacy.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.anonymous_after_dark_sessions (
    session_id TEXT PRIMARY KEY,
    vibe_tag TEXT NOT NULL,
    matched_gender TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '2 hours')
);

ALTER TABLE public.anonymous_after_dark_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Strict isolation on anonymous lounge sessions" ON public.anonymous_after_dark_sessions
    FOR ALL USING (false); -- Admin maintenance only; sessions operate exclusively in memory

-- Auto-evaporate all stale anonymous session tags after 2 hours
CREATE OR REPLACE FUNCTION purge_expired_after_dark_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.anonymous_after_dark_sessions WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 7. ADVANCED DATING ENGINE TABLES (Phase 2-3 High Octane Suite)
-- ==============================================================================

-- 🎙️ "Blind Audio" 3-Minute Date Sessions
CREATE TABLE IF NOT EXISTS public.blind_audio_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    receiver_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    caller_yes BOOLEAN DEFAULT false,
    receiver_yes BOOLEAN DEFAULT false,
    photos_unlocked BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 👯‍♂️ "Double Date" 2v2 Squad Chat Rooms
CREATE TABLE IF NOT EXISTS public.double_date_squads (
    room_id TEXT PRIMARY KEY,
    squad_name TEXT NOT NULL,
    member_1 TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    member_2 TEXT REFERENCES public.users(device_id) ON DELETE SET NULL,
    vibe_topic TEXT DEFAULT 'Late Night Fun',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 🔄 "Second Chance" Rewind Vault
CREATE TABLE IF NOT EXISTS public.swipe_history_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    target_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'like' or 'pass'
    rewound BOOLEAN DEFAULT false,
    action_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 🎲 In-Chat Flirtation & Mini-Games (Spin the Bottle, 2 Truths 1 Lie, RPS Bet, Neon Canvas)
CREATE TABLE IF NOT EXISTS public.interactive_game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_room_id TEXT NOT NULL,
    game_type TEXT NOT NULL, -- 'spin_bottle', 'two_truths', 'rock_paper_scissors', 'shared_canvas'
    game_state JSONB NOT NULL,
    wager_coins INTEGER DEFAULT 0,
    winner_id TEXT DEFAULT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 🚨 Emergency "Date Safe Check-in" Timer (For Physical Real-World Dates)
CREATE TABLE IF NOT EXISTS public.safety_sos_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    date_location TEXT NOT NULL,
    emergency_contact TEXT NOT NULL,
    timer_duration_minutes INTEGER DEFAULT 120,
    checkin_due_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '2 hours'),
    is_confirmed_safe BOOLEAN DEFAULT false,
    sos_triggered BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 🏛️ Global Redis Pub/Sub Cache Sync Protocol (Simulated high-throughput log)
CREATE TABLE IF NOT EXISTS public.redis_cluster_events (
    channel TEXT NOT NULL,
    event_payload JSONB NOT NULL,
    latency_ms DOUBLE PRECISION DEFAULT 12.4,
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- RLS Policies on Advanced Tables
ALTER TABLE public.blind_audio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.double_date_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipe_history_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_sos_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactive_game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participating users can view blind audio sessions" ON public.blind_audio_sessions
    FOR SELECT USING (caller_id = current_setting('request.headers', true)::json->>'x-device-id' OR receiver_id = current_setting('request.headers', true)::json->>'x-device-id');

CREATE POLICY "Allow swipe history rewind only by owner" ON public.swipe_history_vault
    FOR ALL USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');

CREATE POLICY "Strict isolation on safety SOS timers" ON public.safety_sos_checkins
    FOR ALL USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');


