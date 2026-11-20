-- ============================================================
-- DRAFT DAY - Complete Database Schema
-- Run this in your Supabase SQL Editor to set up the database
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  coins INTEGER NOT NULL DEFAULT 500,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  battle_pass_tier INTEGER NOT NULL DEFAULT 0,
  battle_pass_premium BOOLEAN NOT NULL DEFAULT false,
  favorite_team TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PLAYERS (created by users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT,
  position TEXT NOT NULL CHECK (position IN ('QB','RB','WR','TE','OL','DE','DT','LB','CB','S','K','P')),

  -- Physical appearance
  skin_tone TEXT NOT NULL DEFAULT 'medium',
  hair_style TEXT NOT NULL DEFAULT 'short',
  hair_color TEXT NOT NULL DEFAULT 'black',
  face_style TEXT NOT NULL DEFAULT 'face_1',
  body_build TEXT NOT NULL DEFAULT 'athletic' CHECK (body_build IN ('slim','athletic','power','big')),
  height_inches INTEGER NOT NULL DEFAULT 72,
  weight_lbs INTEGER NOT NULL DEFAULT 215,

  -- Equipment
  jersey_number INTEGER NOT NULL DEFAULT 1,
  helmet_style TEXT NOT NULL DEFAULT 'standard',
  visor TEXT DEFAULT NULL,
  gloves TEXT DEFAULT NULL,
  cleats TEXT DEFAULT NULL,
  sleeve TEXT DEFAULT NULL,
  accessories TEXT[] DEFAULT '{}',

  -- Uniform
  primary_color TEXT NOT NULL DEFAULT '#25a56e',
  secondary_color TEXT NOT NULL DEFAULT '#ffffff',
  uniform_style TEXT NOT NULL DEFAULT 'modern',

  -- Celebration
  celebration TEXT NOT NULL DEFAULT 'spike',

  -- Overall rating (computed from attributes)
  overall INTEGER NOT NULL DEFAULT 60,

  -- Position attributes (all 0-99)
  speed INTEGER NOT NULL DEFAULT 70,
  strength INTEGER NOT NULL DEFAULT 65,
  agility INTEGER NOT NULL DEFAULT 70,
  awareness INTEGER NOT NULL DEFAULT 65,
  stamina INTEGER NOT NULL DEFAULT 75,

  -- QB specific
  throw_power INTEGER DEFAULT NULL,
  throw_accuracy INTEGER DEFAULT NULL,
  throw_on_run INTEGER DEFAULT NULL,
  pocket_presence INTEGER DEFAULT NULL,

  -- RB/WR/TE specific
  catching INTEGER DEFAULT NULL,
  route_running INTEGER DEFAULT NULL,
  break_tackle INTEGER DEFAULT NULL,
  carrying INTEGER DEFAULT NULL,

  -- OL specific
  pass_block INTEGER DEFAULT NULL,
  run_block INTEGER DEFAULT NULL,

  -- Defensive specific
  tackle INTEGER DEFAULT NULL,
  pursuit INTEGER DEFAULT NULL,
  play_recognition INTEGER DEFAULT NULL,
  press_coverage INTEGER DEFAULT NULL,
  man_coverage INTEGER DEFAULT NULL,
  zone_coverage INTEGER DEFAULT NULL,
  block_shedding INTEGER DEFAULT NULL,

  -- K/P specific
  kick_power INTEGER DEFAULT NULL,
  kick_accuracy INTEGER DEFAULT NULL,

  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CAREERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.careers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,

  -- Career stage
  stage TEXT NOT NULL DEFAULT 'high_school' CHECK (stage IN ('high_school','college','nfl','retired')),
  current_year INTEGER NOT NULL DEFAULT 1,
  season INTEGER NOT NULL DEFAULT 1,

  -- High school
  hs_school TEXT DEFAULT NULL,
  hs_state TEXT DEFAULT NULL,
  hs_championships INTEGER NOT NULL DEFAULT 0,

  -- College
  college TEXT DEFAULT NULL,
  college_conference TEXT DEFAULT NULL,
  college_championships INTEGER NOT NULL DEFAULT 0,
  heisman_winner BOOLEAN NOT NULL DEFAULT false,
  all_american BOOLEAN NOT NULL DEFAULT false,

  -- NFL
  nfl_team TEXT DEFAULT NULL,
  draft_round INTEGER DEFAULT NULL,
  draft_pick INTEGER DEFAULT NULL,
  contracts_signed INTEGER NOT NULL DEFAULT 0,

  -- Accolades
  super_bowl_wins INTEGER NOT NULL DEFAULT 0,
  mvp_awards INTEGER NOT NULL DEFAULT 0,
  pro_bowl_selections INTEGER NOT NULL DEFAULT 0,
  all_pro_selections INTEGER NOT NULL DEFAULT 0,
  hall_of_fame BOOLEAN NOT NULL DEFAULT false,

  -- Reputation
  reputation_score INTEGER NOT NULL DEFAULT 50,
  fan_favorite BOOLEAN NOT NULL DEFAULT false,

  -- Career totals (position-specific, stored as JSONB)
  career_stats JSONB NOT NULL DEFAULT '{}',

  -- Story flags
  story_flags JSONB NOT NULL DEFAULT '{}',

  is_active BOOLEAN NOT NULL DEFAULT true,
  retired_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GAME RESULTS & STATS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  career_id UUID REFERENCES public.careers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Game context
  season INTEGER NOT NULL,
  week INTEGER NOT NULL,
  stage TEXT NOT NULL,
  game_type TEXT NOT NULL DEFAULT 'regular' CHECK (game_type IN ('regular','playoff','championship','bowl','super_bowl')),

  -- Teams
  player_team TEXT NOT NULL,
  opponent_team TEXT NOT NULL,
  player_score INTEGER NOT NULL DEFAULT 0,
  opponent_score INTEGER NOT NULL DEFAULT 0,
  won BOOLEAN NOT NULL DEFAULT false,

  -- Position-specific stats (JSONB for flexibility)
  stats JSONB NOT NULL DEFAULT '{}',

  -- Gameplay mode used
  gameplay_mode TEXT NOT NULL DEFAULT 'simple' CHECK (gameplay_mode IN ('simple','advanced','none')),

  -- Performance rating for this game
  game_rating INTEGER NOT NULL DEFAULT 70,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STORY EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.story_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  career_id UUID REFERENCES public.careers(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  choice_made TEXT DEFAULT NULL,
  outcome TEXT DEFAULT NULL,
  reputation_change INTEGER NOT NULL DEFAULT 0,
  season INTEGER NOT NULL,
  week INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FRIENDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- ============================================================
-- SHOP ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shop_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('helmet','gloves','cleats','uniform','celebration','player_card','profile_cosmetic','accessory','special')),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common','rare','epic','legendary')),
  coin_price INTEGER NOT NULL,
  image_url TEXT,
  item_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DAILY SHOP (refreshes every 24h)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_shop (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_date DATE NOT NULL DEFAULT CURRENT_DATE,
  items JSONB NOT NULL DEFAULT '[]',
  featured_item_id UUID REFERENCES public.shop_items(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_date)
);

-- ============================================================
-- PURCHASES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  shop_item_id UUID REFERENCES public.shop_items(id) NOT NULL,
  coins_spent INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- OWNED ITEMS (inventory)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.owned_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  shop_item_id UUID REFERENCES public.shop_items(id) NOT NULL,
  equipped_to UUID REFERENCES public.players(id) ON DELETE SET NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, shop_item_id)
);

-- ============================================================
-- BATTLE PASS TIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.battle_pass_tiers (
  tier INTEGER PRIMARY KEY CHECK (tier BETWEEN 1 AND 100),
  season INTEGER NOT NULL DEFAULT 1,
  xp_required INTEGER NOT NULL,

  -- Free rewards
  free_reward_type TEXT CHECK (free_reward_type IN ('coins','xp','item','cosmetic','title','badge')),
  free_reward_value JSONB DEFAULT '{}',
  free_reward_label TEXT,

  -- Premium rewards
  premium_reward_type TEXT CHECK (premium_reward_type IN ('coins','xp','item','cosmetic','title','badge','exclusive')),
  premium_reward_value JSONB DEFAULT '{}',
  premium_reward_label TEXT
);

-- ============================================================
-- CHALLENGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily','weekly')),
  positions TEXT[] NOT NULL DEFAULT '{}',  -- empty = all positions

  -- Objective
  objective_type TEXT NOT NULL,
  objective_target INTEGER NOT NULL,

  -- Rewards
  coin_reward INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 0,

  -- Validity window
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,

  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHALLENGE PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.challenge_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  career_id UUID REFERENCES public.careers(id) ON DELETE SET NULL,

  current_value INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  rewarded BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT NULL,

  UNIQUE(user_id, challenge_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('friend_request','achievement','challenge_complete','shop_refresh','reward','leaderboard','career_milestone')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LEADERBOARD CACHE (weekly)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  career_id UUID REFERENCES public.careers(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  stat_summary JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- ============================================================
-- HALL OF FAME
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hall_of_fame (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  career_id UUID REFERENCES public.careers(id) ON DELETE CASCADE NOT NULL,
  player_name TEXT NOT NULL,
  position TEXT NOT NULL,
  inducted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  career_summary JSONB NOT NULL DEFAULT '{}',
  highlight TEXT
);

-- ============================================================
-- XP TRANSACTIONS (audit trail for anti-cheat)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  reference_id UUID DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COIN TRANSACTIONS (audit trail for anti-cheat)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,  -- positive = earned, negative = spent
  source TEXT NOT NULL,
  reference_id UUID DEFAULT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owned_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_of_fame ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public players are viewable by everyone" ON public.players FOR SELECT USING (true);
CREATE POLICY "Public careers are viewable by everyone" ON public.careers FOR SELECT USING (true);
CREATE POLICY "Shop items are viewable by everyone" ON public.shop_items FOR SELECT USING (true);
CREATE POLICY "Battle pass tiers are viewable by everyone" ON public.battle_pass_tiers FOR SELECT USING (true);
CREATE POLICY "Active challenges are viewable by everyone" ON public.challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Hall of fame is viewable by everyone" ON public.hall_of_fame FOR SELECT USING (true);
CREATE POLICY "Leaderboard is viewable by everyone" ON public.leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Daily shop is viewable by everyone" ON public.daily_shop FOR SELECT USING (true);

-- User-specific write policies
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own players" ON public.players FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own careers" ON public.careers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own game results" ON public.game_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game results" ON public.game_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own story events" ON public.story_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own story events" ON public.story_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own items" ON public.owned_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own challenge progress" ON public.challenge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Friendship policies
CREATE POLICY "Users can view own friendships" ON public.friendships FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can send friend requests" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update own friendships" ON public.friendships FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'player_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', 'New Player')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update profile updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_careers_updated_at BEFORE UPDATE ON public.careers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Award coins securely (server-side only via service role)
CREATE OR REPLACE FUNCTION public.award_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE public.profiles
  SET coins = coins + p_amount
  WHERE id = p_user_id
  RETURNING coins INTO new_balance;

  INSERT INTO public.coin_transactions (user_id, amount, source, reference_id, balance_after)
  VALUES (p_user_id, p_amount, p_source, p_reference_id, new_balance);

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Award XP and handle leveling
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT
)
RETURNS TABLE(new_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN) AS $$
DECLARE
  current_xp INTEGER;
  current_level INTEGER;
  next_level_xp INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_leveled_up BOOLEAN := false;
BEGIN
  SELECT xp, level INTO current_xp, current_level FROM public.profiles WHERE id = p_user_id;

  v_new_xp := current_xp + p_amount;
  v_new_level := current_level;

  -- Level up formula: level N requires N * 1000 XP from previous level
  LOOP
    next_level_xp := v_new_level * 1000;
    EXIT WHEN v_new_xp < next_level_xp;
    v_new_xp := v_new_xp - next_level_xp;
    v_new_level := v_new_level + 1;
    v_leveled_up := true;
  END LOOP;

  UPDATE public.profiles SET xp = v_new_xp, level = v_new_level WHERE id = p_user_id;

  INSERT INTO public.xp_transactions (user_id, amount, source) VALUES (p_user_id, p_amount, p_source);

  RETURN QUERY SELECT v_new_xp, v_new_level, v_leveled_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED: Battle Pass Tiers (Season 1)
-- ============================================================
INSERT INTO public.battle_pass_tiers (tier, season, xp_required, free_reward_type, free_reward_value, free_reward_label, premium_reward_type, premium_reward_value, premium_reward_label)
VALUES
  (1,  1, 500,  'coins', '{"amount":100}', '100 Coins',         'coins',    '{"amount":200}',  '200 Coins'),
  (2,  1, 600,  'title', '{"title":"Rookie"}', 'Rookie Title',  'cosmetic', '{"item":"chrome_helmet"}', 'Chrome Helmet'),
  (3,  1, 700,  'coins', '{"amount":150}', '150 Coins',         'coins',    '{"amount":300}',  '300 Coins'),
  (4,  1, 800,  'badge', '{"badge":"star_1"}', 'Star Badge',    'item',     '{"item":"lightning_cleats"}', 'Lightning Cleats'),
  (5,  1, 900,  'coins', '{"amount":200}', '200 Coins',         'coins',    '{"amount":400}',  '400 Coins'),
  (6,  1, 1000, 'cosmetic', '{"item":"aurora_theme"}', 'Aurora Theme', 'cosmetic', '{"item":"gold_gloves"}', 'Gold Gloves'),
  (7,  1, 1100, 'coins', '{"amount":200}', '200 Coins',         'coins',    '{"amount":400}',  '400 Coins'),
  (8,  1, 1200, 'title', '{"title":"Starter"}', 'Starter Title', 'item',   '{"item":"pro_visor"}', 'Pro Visor'),
  (9,  1, 1300, 'coins', '{"amount":250}', '250 Coins',         'coins',    '{"amount":500}',  '500 Coins'),
  (10, 1, 1500, 'cosmetic', '{"item":"neon_grid_card"}', 'Neon Grid Card', 'cosmetic', '{"item":"blaze_uniform"}', 'Blaze Uniform'),
  (11, 1, 1600, 'coins', '{"amount":250}', '250 Coins',         'coins',    '{"amount":500}',  '500 Coins'),
  (12, 1, 1700, 'badge', '{"badge":"star_2"}', '2-Star Badge',  'item',     '{"item":"speed_cleats"}', 'Speed Cleats'),
  (13, 1, 1800, 'coins', '{"amount":300}', '300 Coins',         'coins',    '{"amount":600}',  '600 Coins'),
  (14, 1, 1900, 'cosmetic', '{"item":"black_gold_theme"}', 'Black Gold Theme', 'item', '{"item":"carbon_helmet"}', 'Carbon Helmet'),
  (15, 1, 2000, 'title', '{"title":"Rising Star"}', 'Rising Star Title', 'cosmetic', '{"item":"electric_celebration"}', 'Electric Celebration'),
  (16, 1, 2100, 'coins', '{"amount":300}', '300 Coins',         'coins',    '{"amount":600}',  '600 Coins'),
  (17, 1, 2200, 'item',  '{"item":"carbon_gloves"}', 'Carbon Gloves', 'coins', '{"amount":700}', '700 Coins'),
  (18, 1, 2300, 'coins', '{"amount":350}', '350 Coins',         'cosmetic', '{"item":"platinum_theme"}', 'Platinum Theme'),
  (19, 1, 2400, 'badge', '{"badge":"star_3"}', '3-Star Badge',  'coins',    '{"amount":700}',  '700 Coins'),
  (20, 1, 2500, 'cosmetic', '{"item":"galaxy_card"}', 'Galaxy Card', 'item', '{"item":"galaxy_cleats"}', 'Galaxy Cleats'),
  (21, 1, 2600, 'coins', '{"amount":400}', '400 Coins',         'coins',    '{"amount":800}',  '800 Coins'),
  (22, 1, 2700, 'title', '{"title":"Pro Bowler"}', 'Pro Bowler Title', 'item', '{"item":"ice_helmet"}', 'Ice Helmet'),
  (23, 1, 2800, 'coins', '{"amount":400}', '400 Coins',         'coins',    '{"amount":800}',  '800 Coins'),
  (24, 1, 2900, 'cosmetic', '{"item":"frost_theme"}', 'Frost Theme', 'cosmetic', '{"item":"midnight_uniform"}', 'Midnight Uniform'),
  (25, 1, 3000, 'item',  '{"item":"pro_celebration"}', 'Pro Celebration', 'item', '{"item":"ring_of_fire_cleats"}', 'Ring of Fire Cleats'),
  (26, 1, 3100, 'coins', '{"amount":450}', '450 Coins',         'coins',    '{"amount":900}',  '900 Coins'),
  (27, 1, 3200, 'badge', '{"badge":"star_4"}', '4-Star Badge',  'item',     '{"item":"predator_gloves"}', 'Predator Gloves'),
  (28, 1, 3300, 'coins', '{"amount":450}', '450 Coins',         'coins',    '{"amount":900}',  '900 Coins'),
  (29, 1, 3400, 'cosmetic', '{"item":"deep_space_card"}', 'Deep Space Card', 'cosmetic', '{"item":"ghost_visor"}', 'Ghost Visor'),
  (30, 1, 3500, 'title', '{"title":"All-Pro"}', 'All-Pro Title', 'item',    '{"item":"all_pro_helmet"}', 'All-Pro Helmet'),
  (31, 1, 3600, 'coins', '{"amount":500}', '500 Coins',         'coins',    '{"amount":1000}', '1000 Coins'),
  (32, 1, 3700, 'item',  '{"item":"champion_celebration"}', 'Champion Celebration', 'cosmetic', '{"item":"champion_uniform"}', 'Champion Uniform'),
  (33, 1, 3800, 'coins', '{"amount":500}', '500 Coins',         'coins',    '{"amount":1000}', '1000 Coins'),
  (34, 1, 3900, 'badge', '{"badge":"star_5"}', '5-Star Badge',  'item',     '{"item":"blitz_cleats"}', 'Blitz Cleats'),
  (35, 1, 4000, 'cosmetic', '{"item":"volt_theme"}', 'Volt Theme', 'item',  '{"item":"volt_helmet"}', 'Volt Helmet'),
  (36, 1, 4100, 'coins', '{"amount":550}', '550 Coins',         'coins',    '{"amount":1100}', '1100 Coins'),
  (37, 1, 4200, 'title', '{"title":"MVP"}', 'MVP Title',        'cosmetic', '{"item":"mvp_card"}', 'MVP Card'),
  (38, 1, 4300, 'coins', '{"amount":550}', '550 Coins',         'coins',    '{"amount":1100}', '1100 Coins'),
  (39, 1, 4400, 'item',  '{"item":"turbo_cleats"}', 'Turbo Cleats', 'item', '{"item":"turbo_gloves"}', 'Turbo Gloves'),
  (40, 1, 5000, 'cosmetic', '{"item":"fire_theme"}', 'Fire Theme', 'cosmetic', '{"item":"inferno_celebration"}', 'Inferno Celebration'),
  (41, 1, 5100, 'coins', '{"amount":600}', '600 Coins',         'coins',    '{"amount":1200}', '1200 Coins'),
  (42, 1, 5200, 'badge', '{"badge":"diamond_1"}', 'Diamond Badge', 'item', '{"item":"diamond_visor"}', 'Diamond Visor'),
  (43, 1, 5300, 'coins', '{"amount":600}', '600 Coins',         'coins',    '{"amount":1200}', '1200 Coins'),
  (44, 1, 5400, 'title', '{"title":"Champion"}', 'Champion Title', 'cosmetic', '{"item":"champion_card"}', 'Champion Card'),
  (45, 1, 5500, 'item',  '{"item":"storm_helmet"}', 'Storm Helmet', 'item', '{"item":"storm_cleats"}', 'Storm Cleats'),
  (46, 1, 5600, 'coins', '{"amount":650}', '650 Coins',         'coins',    '{"amount":1300}', '1300 Coins'),
  (47, 1, 5700, 'cosmetic', '{"item":"aurora_celebration"}', 'Aurora Celebration', 'item', '{"item":"quantum_gloves"}', 'Quantum Gloves'),
  (48, 1, 5800, 'coins', '{"amount":650}', '650 Coins',         'coins',    '{"amount":1300}', '1300 Coins'),
  (49, 1, 5900, 'badge', '{"badge":"diamond_2"}', '2x Diamond',  'cosmetic', '{"item":"quantum_theme"}', 'Quantum Theme'),
  (50, 1, 6000, 'item',  '{"item":"halfway_celebration"}', 'Halfway Celebration', 'item', '{"item":"quantum_helmet"}', 'Quantum Helmet'),
  -- Tiers 51-100 (condensed)
  (51,1,6200,'coins','{"amount":700}','700 Coins','coins','{"amount":1400}','1400 Coins'),
  (52,1,6400,'title','{"title":"Franchise Player"}','Franchise Player Title','item','{"item":"franchise_uniform"}','Franchise Uniform'),
  (53,1,6600,'coins','{"amount":700}','700 Coins','coins','{"amount":1400}','1400 Coins'),
  (54,1,6800,'badge','{"badge":"diamond_3"}','3x Diamond','item','{"item":"supernova_cleats"}','Supernova Cleats'),
  (55,1,7000,'cosmetic','{"item":"void_theme"}','Void Theme','cosmetic','{"item":"void_celebration"}','Void Celebration'),
  (56,1,7200,'coins','{"amount":750}','750 Coins','coins','{"amount":1500}','1500 Coins'),
  (57,1,7400,'item','{"item":"phantom_visor"}','Phantom Visor','item','{"item":"phantom_gloves"}','Phantom Gloves'),
  (58,1,7600,'coins','{"amount":750}','750 Coins','coins','{"amount":1500}','1500 Coins'),
  (59,1,7800,'badge','{"badge":"diamond_4"}','4x Diamond','cosmetic','{"item":"phantom_card"}','Phantom Card'),
  (60,1,8000,'title','{"title":"Legend"}','Legend Title','item','{"item":"legend_helmet"}','Legend Helmet'),
  (61,1,8200,'coins','{"amount":800}','800 Coins','coins','{"amount":1600}','1600 Coins'),
  (62,1,8400,'cosmetic','{"item":"legend_theme"}','Legend Theme','item','{"item":"legend_cleats"}','Legend Cleats'),
  (63,1,8600,'coins','{"amount":800}','800 Coins','coins','{"amount":1600}','1600 Coins'),
  (64,1,8800,'badge','{"badge":"diamond_5"}','5x Diamond','cosmetic','{"item":"warpath_celebration"}','Warpath Celebration'),
  (65,1,9000,'item','{"item":"warpath_uniform"}','Warpath Uniform','item','{"item":"warpath_helmet"}','Warpath Helmet'),
  (66,1,9200,'coins','{"amount":850}','850 Coins','coins','{"amount":1700}','1700 Coins'),
  (67,1,9400,'title','{"title":"Hall of Famer"}','Hall of Famer Title','cosmetic','{"item":"hof_card"}','HOF Card'),
  (68,1,9600,'coins','{"amount":850}','850 Coins','coins','{"amount":1700}','1700 Coins'),
  (69,1,9800,'cosmetic','{"item":"obsidian_theme"}','Obsidian Theme','item','{"item":"obsidian_cleats"}','Obsidian Cleats'),
  (70,1,10000,'badge','{"badge":"elite_1"}','Elite Badge','item','{"item":"obsidian_helmet"}','Obsidian Helmet'),
  (71,1,10500,'coins','{"amount":900}','900 Coins','coins','{"amount":1800}','1800 Coins'),
  (72,1,11000,'item','{"item":"sovereign_gloves"}','Sovereign Gloves','cosmetic','{"item":"sovereign_celebration"}','Sovereign Celebration'),
  (73,1,11500,'coins','{"amount":900}','900 Coins','coins','{"amount":1800}','1800 Coins'),
  (74,1,12000,'cosmetic','{"item":"sovereign_card"}','Sovereign Card','item','{"item":"sovereign_uniform"}','Sovereign Uniform'),
  (75,1,12500,'title','{"title":"G.O.A.T."}','G.O.A.T. Title','item','{"item":"sovereign_helmet"}','Sovereign Helmet'),
  (76,1,13000,'coins','{"amount":1000}','1000 Coins','coins','{"amount":2000}','2000 Coins'),
  (77,1,13500,'badge','{"badge":"elite_2"}','2x Elite Badge','cosmetic','{"item":"apex_theme"}','Apex Theme'),
  (78,1,14000,'coins','{"amount":1000}','1000 Coins','coins','{"amount":2000}','2000 Coins'),
  (79,1,14500,'item','{"item":"apex_visor"}','Apex Visor','item','{"item":"apex_cleats"}','Apex Cleats'),
  (80,1,15000,'cosmetic','{"item":"apex_celebration"}','Apex Celebration','item','{"item":"apex_helmet"}','Apex Helmet'),
  (81,1,15500,'coins','{"amount":1100}','1100 Coins','coins','{"amount":2200}','2200 Coins'),
  (82,1,16000,'title','{"title":"Dynasty Builder"}','Dynasty Builder','item','{"item":"dynasty_gloves"}','Dynasty Gloves'),
  (83,1,16500,'coins','{"amount":1100}','1100 Coins','coins','{"amount":2200}','2200 Coins'),
  (84,1,17000,'badge','{"badge":"elite_3"}','3x Elite Badge','cosmetic','{"item":"dynasty_card"}','Dynasty Card'),
  (85,1,17500,'cosmetic','{"item":"dynasty_theme"}','Dynasty Theme','item','{"item":"dynasty_cleats"}','Dynasty Cleats'),
  (86,1,18000,'coins','{"amount":1200}','1200 Coins','coins','{"amount":2500}','2500 Coins'),
  (87,1,18500,'item','{"item":"dynasty_helmet"}','Dynasty Helmet','cosmetic','{"item":"dynasty_celebration"}','Dynasty Celebration'),
  (88,1,19000,'coins','{"amount":1200}','1200 Coins','coins','{"amount":2500}','2500 Coins'),
  (89,1,19500,'badge','{"badge":"elite_4"}','4x Elite Badge','item','{"item":"dynasty_uniform"}','Dynasty Uniform'),
  (90,1,20000,'title','{"title":"Immortal"}','Immortal Title','item','{"item":"immortal_helmet"}','Immortal Helmet'),
  (91,1,21000,'coins','{"amount":1500}','1500 Coins','coins','{"amount":3000}','3000 Coins'),
  (92,1,22000,'cosmetic','{"item":"immortal_theme"}','Immortal Theme','item','{"item":"immortal_cleats"}','Immortal Cleats'),
  (93,1,23000,'coins','{"amount":1500}','1500 Coins','coins','{"amount":3000}','3000 Coins'),
  (94,1,24000,'item','{"item":"immortal_gloves"}','Immortal Gloves','cosmetic','{"item":"immortal_celebration"}','Immortal Celebration'),
  (95,1,25000,'badge','{"badge":"elite_5"}','5x Elite Badge','item','{"item":"immortal_uniform"}','Immortal Uniform'),
  (96,1,27000,'coins','{"amount":2000}','2000 Coins','coins','{"amount":4000}','4000 Coins'),
  (97,1,29000,'cosmetic','{"item":"ascendant_theme"}','Ascendant Theme','item','{"item":"ascendant_helmet"}','Ascendant Helmet'),
  (98,1,31000,'coins','{"amount":2000}','2000 Coins','cosmetic','{"item":"ascendant_celebration"}','Ascendant Celebration'),
  (99,1,33000,'title','{"title":"The Draft Day Legend"}','Draft Day Legend Title','item','{"item":"ascendant_uniform"}','Ascendant Uniform'),
  (100,1,35000,'badge','{"badge":"season_1_complete"}','Season 1 Complete','item','{"item":"s1_trophy"}','Season 1 Trophy')
ON CONFLICT (tier) DO NOTHING;

-- ============================================================
-- SEED: Shop Items
-- ============================================================
INSERT INTO public.shop_items (name, description, category, rarity, coin_price, item_data) VALUES
  ('Chrome Helmet', 'Mirror-finish chrome helmet', 'helmet', 'rare', 800, '{"style":"chrome"}'),
  ('Blaze Helmet', 'Flame-streaked design', 'helmet', 'epic', 1200, '{"style":"blaze"}'),
  ('Gold Rush Helmet', '24-karat gold finish', 'helmet', 'legendary', 2500, '{"style":"gold_rush"}'),
  ('Storm Helmet', 'Electric storm design', 'helmet', 'epic', 1400, '{"style":"storm"}'),
  ('Midnight Helmet', 'Matte black premium', 'helmet', 'rare', 900, '{"style":"midnight"}'),
  ('Speed Gloves', 'Aerodynamic grip gloves', 'gloves', 'common', 400, '{"style":"speed"}'),
  ('Gold Gloves', 'Premium gold gloves', 'gloves', 'rare', 750, '{"style":"gold"}'),
  ('Carbon Gloves', 'Carbon fiber reinforced', 'gloves', 'epic', 1100, '{"style":"carbon"}'),
  ('Predator Gloves', 'Maximum grip technology', 'gloves', 'legendary', 2000, '{"style":"predator"}'),
  ('Lightning Cleats', 'Speed-focused cleats', 'cleats', 'rare', 700, '{"style":"lightning"}'),
  ('Galaxy Cleats', 'Deep space design', 'cleats', 'epic', 1300, '{"style":"galaxy"}'),
  ('Ring of Fire Cleats', 'Flame pattern design', 'cleats', 'epic', 1500, '{"style":"ring_of_fire"}'),
  ('Supernova Cleats', 'Explosive performance', 'cleats', 'legendary', 2200, '{"style":"supernova"}'),
  ('Blaze Uniform', 'Flame-streaked uniform set', 'uniform', 'epic', 1800, '{"style":"blaze"}'),
  ('Midnight Uniform', 'All-black stealth design', 'uniform', 'rare', 1200, '{"style":"midnight"}'),
  ('Champion Uniform', 'Trophy gold uniform', 'uniform', 'legendary', 3000, '{"style":"champion"}'),
  ('Pro Visor', 'Clear UV-protection visor', 'accessory', 'common', 300, '{"style":"pro_clear"}'),
  ('Tinted Visor', 'Dark tinted visor', 'accessory', 'rare', 600, '{"style":"tinted"}'),
  ('Ghost Visor', 'Iridescent mirror visor', 'accessory', 'epic', 1000, '{"style":"ghost"}'),
  ('Spike Celebration', 'Classic ball spike', 'celebration', 'common', 200, '{"anim":"spike"}'),
  ('Electric Slide', 'High-energy dance', 'celebration', 'rare', 600, '{"anim":"electric_slide"}'),
  ('Inferno', 'Fire-themed celebration', 'celebration', 'epic', 1200, '{"anim":"inferno"}'),
  ('Griddy', 'The viral dance', 'celebration', 'rare', 800, '{"anim":"griddy"}'),
  ('Neon Grid Card', 'Neon grid player card background', 'player_card', 'rare', 700, '{"bg":"neon_grid"}'),
  ('Galaxy Card', 'Deep space player card', 'player_card', 'epic', 1400, '{"bg":"galaxy"}'),
  ('Gold Rush Card', 'Premium gold player card', 'player_card', 'legendary', 2800, '{"bg":"gold_rush"}'),
  ('Aurora Theme', 'Profile aurora cosmetic', 'profile_cosmetic', 'rare', 500, '{"theme":"aurora"}'),
  ('Frost Theme', 'Ice-blue profile theme', 'profile_cosmetic', 'rare', 500, '{"theme":"frost"}'),
  ('Obsidian Theme', 'Dark obsidian profile', 'profile_cosmetic', 'epic', 1200, '{"theme":"obsidian"}')
ON CONFLICT DO NOTHING;
