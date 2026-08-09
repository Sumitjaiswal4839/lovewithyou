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
