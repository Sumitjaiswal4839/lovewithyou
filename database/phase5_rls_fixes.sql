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
