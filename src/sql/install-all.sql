-- =====================================================
-- DailyStack - Complete Database Schema (V2.1 - Optimized & Fixed)
-- Architecture: Single Source of Truth, Soft Deletes, Optimized Matching
-- =====================================================

-- =====================================================
-- STEP 1: DROP OLD TRIGGERS & FUNCTIONS (จากตารางที่ไม่ได้ลบ)
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.check_and_create_match() CASCADE;

-- =====================================================
-- STEP 2: CLEAN DROP ALL TABLES (avoid conflicts)
-- =====================================================
-- (การใช้ CASCADE จะลบ Triggers ที่ผูกกับตารางเหล่านี้ให้อัตโนมัติ)
DROP TABLE IF EXISTS public.user_events CASCADE;
DROP TABLE IF EXISTS public.user_progressive_answers CASCADE;
DROP TABLE IF EXISTS public.user_cooldowns CASCADE;
DROP TABLE IF EXISTS public.user_match_limits CASCADE;
DROP TABLE IF EXISTS public.compatibility_reports CASCADE;
DROP TABLE IF EXISTS public.ai_icebreakers CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.swipes CASCADE;
DROP TABLE IF EXISTS public.discovery_profiles CASCADE;
DROP TABLE IF EXISTS public.user_memberships CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE; 
DROP TABLE IF EXISTS public.users CASCADE;

-- =====================================================
-- STEP 3: CORE USERS TABLE (Single Source of Truth)
-- =====================================================
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    
    -- Display & Identity
    nickname TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    
    -- Demographics (Mapped with Onboarding.tsx)
    birth_month INTEGER,
    birth_year INTEGER,
    age INTEGER,
    gender VARCHAR(20),
    location VARCHAR(100), -- Used for country/city
    
    -- Dating Photos
    dating_photos TEXT[],
    
    -- Lifestyle & Preferences (From Onboarding Step 3)
    relationship_goals VARCHAR(50),
    sleep_schedule VARCHAR(50),
    work_style VARCHAR(50),
    social_energy VARCHAR(50),
    
    -- Interests & Extended Profile
    interests TEXT[],
    occupation VARCHAR(100),
    education VARCHAR(100),
    mbti VARCHAR(10),
    
    -- Global Settings
    dating_enabled BOOLEAN DEFAULT true,
    show_online_status BOOLEAN DEFAULT true,
    
    -- Status & Progression
    is_premium BOOLEAN DEFAULT false,
    premium_tier VARCHAR(20) DEFAULT 'free',
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 0,
    profile_completion_percent INTEGER DEFAULT 0,
    
    -- Soft Delete & Account Status
    account_status VARCHAR(20) DEFAULT 'active',
    deleted_at TIMESTAMPTZ, -- Enables Soft Delete logic
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_active ON public.users(account_status) WHERE deleted_at IS NULL;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active profiles" ON public.users 
    FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users can update own profile" ON public.users 
    FOR UPDATE USING (auth.uid() = id);
-- Allow insert via trigger (SECURITY DEFINER function)
CREATE POLICY "Users can insert via trigger" ON public.users 
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- STEP 4: DISCOVERY PROFILES (Dating Algorithm Config)
-- =====================================================
CREATE TABLE public.discovery_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Compatibility Scores (0-100)
    overall_compatibility_score DECIMAL(5,2) DEFAULT 0,
    lifestyle_score DECIMAL(5,2) DEFAULT 0,
    personality_score DECIMAL(5,2) DEFAULT 0,
    
    -- Discovery Preferences
    discovery_distance_km INTEGER DEFAULT 50,
    preferred_age_min INTEGER DEFAULT 18,
    preferred_age_max INTEGER DEFAULT 35,
    preferred_genders TEXT[],
    
    -- Stats
    total_likes_received INTEGER DEFAULT 0,
    total_matches INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discovery_profiles_user_id ON public.discovery_profiles(user_id);
ALTER TABLE public.discovery_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own discovery" ON public.discovery_profiles
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read discovery" ON public.discovery_profiles
    FOR SELECT USING (true);

-- =====================================================
-- STEP 5: MATCHES & SWIPES (Optimized)
-- =====================================================
CREATE TABLE public.swipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    swiper_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    action VARCHAR(20) NOT NULL, -- 'like', 'pass', 'superlike'
    source VARCHAR(50) DEFAULT 'discovery',
    created_match BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(swiper_id, target_user_id)
);

CREATE TABLE public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Async calculated score
    compatibility_score DECIMAL(5,2) DEFAULT 0,
    is_ultra_match BOOLEAN DEFAULT false,
    
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'unmatched'
    has_conversation BOOLEAN DEFAULT false,
    initiated_by UUID REFERENCES public.users(id),
    
    deleted_at TIMESTAMPTZ, -- Soft delete for unmatched
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- CRITICAL FIX: Ensure user1 is always the smaller UUID to prevent A->B and B->A duplicates
    CONSTRAINT valid_user_order CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_swipes_swiper ON public.swipes(swiper_id);
CREATE INDEX idx_matches_users ON public.matches(user1_id, user2_id);

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own swipes" ON public.swipes FOR ALL USING (auth.uid() = swiper_id);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own active matches" ON public.matches 
    FOR SELECT USING ((auth.uid() = user1_id OR auth.uid() = user2_id) AND deleted_at IS NULL);
CREATE POLICY "Users update own matches" ON public.matches 
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- =====================================================
-- STEP 6: CHAT & OTHER FEATURES (Messages, Limits, Memberships)
-- =====================================================
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    read_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_match_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    curated_remaining INTEGER DEFAULT 5,
    explore_remaining INTEGER DEFAULT 10,
    reset_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 day'),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    brand_name VARCHAR(100) NOT NULL,
    card_number VARCHAR(100),
    tier VARCHAR(50) DEFAULT 'member',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view match messages" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())) AND deleted_at IS NULL
);
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

ALTER TABLE public.user_match_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage limits" ON public.user_match_limits FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own memberships" ON public.user_memberships FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- STEP 7: AUTO-CAPTURE USER ON REGISTRATION (Trigger on auth.users)
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- This fires the moment a user signs up (via Email/OTP in AuthPage.tsx)
    INSERT INTO public.users (id, email, nickname, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1))
    );
    
    -- Auto-initialize dependencies
    INSERT INTO public.discovery_profiles (user_id) VALUES (NEW.id);
    INSERT INTO public.user_match_limits (user_id) VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger directly to Supabase Auth
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 8: OPTIMIZED MATCH TRIGGER (Handles ID Ordering & Low I/O)
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_and_create_match()
RETURNS TRIGGER AS $$
DECLARE
    mutual_like RECORD;
    u1 UUID;
    u2 UUID;
BEGIN
    IF NEW.action NOT IN ('like', 'superlike') THEN
        RETURN NEW;
    END IF;
    
    -- Check if target already liked swiper
    SELECT * INTO mutual_like FROM public.swipes
    WHERE swiper_id = NEW.target_user_id
    AND target_user_id = NEW.swiper_id
    AND action IN ('like', 'superlike');
    
    IF mutual_like.id IS NOT NULL THEN
        -- CRITICAL: Order IDs to satisfy CHECK(user1_id < user2_id)
        IF NEW.swiper_id < NEW.target_user_id THEN
            u1 := NEW.swiper_id;
            u2 := NEW.target_user_id;
        ELSE
            u1 := NEW.target_user_id;
            u2 := NEW.swiper_id;
        END IF;
        
        -- Insert match (Score defaults to 0, calculate via Edge Function later)
        INSERT INTO public.matches (user1_id, user2_id, initiated_by)
        VALUES (u1, u2, NEW.swiper_id)
        ON CONFLICT (user1_id, user2_id) DO NOTHING;
        
        NEW.created_match := true;
        
        -- Update stats
        UPDATE public.discovery_profiles 
        SET total_matches = total_matches + 1
        WHERE user_id IN (NEW.swiper_id, NEW.target_user_id);
    END IF;
    
    -- Update receive count
    UPDATE public.discovery_profiles 
    SET total_likes_received = total_likes_received + 1
    WHERE user_id = NEW.target_user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_swipe_created
    AFTER INSERT ON public.swipes
    FOR EACH ROW EXECUTE FUNCTION public.check_and_create_match();

-- =====================================================
-- อัปเดตโครงสร้างให้ตรงกับ DailyStack Auth Spec
-- =====================================================

-- 1. เพิ่มฟิลด์ที่ขาดหายไปในตาราง users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_profile_completion INTEGER DEFAULT 0;

-- 2. สร้างตาราง auth_logs สำหรับ Device Session & Security Management
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    login_method VARCHAR(50), -- 'google', 'apple', 'email', 'otp'
    ip_address INET,
    device_info TEXT,
    login_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON public.auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_login_at ON public.auth_logs(login_at);

ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own auth logs" ON public.auth_logs 
    FOR SELECT USING (auth.uid() = user_id);

-- 3. อัปเดต Trigger ให้ดึง auth_provider ตอนสมัครสมาชิก
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    provider_name VARCHAR(50);
BEGIN
    -- ดึง auth provider จาก app_metadata (เช่น 'google', 'apple', 'email')
    provider_name := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');

    INSERT INTO public.users (id, email, nickname, display_name, auth_provider)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
        provider_name
    );
    
    -- Auto-initialize dependencies
    INSERT INTO public.discovery_profiles (user_id) VALUES (NEW.id);
    INSERT INTO public.user_match_limits (user_id) VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;    