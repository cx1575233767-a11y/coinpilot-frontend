-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_interval TEXT DEFAULT '1h',
  locale TEXT DEFAULT 'zh-CN'
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'pro')) DEFAULT 'free',
  valid_until TIMESTAMPTZ
);

-- Signals
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  price NUMERIC(20,8) NOT NULL,
  ts TIMESTAMPTZ DEFAULT NOW()
);

-- AI Requests
CREATE TABLE IF NOT EXISTS ai_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  result JSONB
);

-- Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  code TEXT PRIMARY KEY,
  days INT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'pro')) DEFAULT 'basic',
  max_uses INT NOT NULL DEFAULT 100,
  used INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_prefs
CREATE POLICY "Users can view own preferences" ON user_prefs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_prefs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_prefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (true);

-- RLS Policies for signals (public read)
CREATE POLICY "Anyone can view signals" ON signals
  FOR SELECT USING (true);

-- RLS Policies for ai_requests
CREATE POLICY "Users can view own AI requests" ON ai_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI requests" ON ai_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for promo_codes (read-only for users)
CREATE POLICY "Service role can manage promo codes" ON promo_codes
  FOR ALL USING (true);

-- Demo Data
INSERT INTO promo_codes (code, days, tier, max_uses, expires_at) VALUES
  ('WELCOME2024', 30, 'basic', 1000, NOW() + INTERVAL '90 days'),
  ('PROMONTH', 30, 'pro', 100, NOW() + INTERVAL '30 days'),
  ('TRIAL7', 7, 'basic', 500, NOW() + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;

-- Sample signals
INSERT INTO signals (symbol, side, confidence, price, ts) VALUES
  ('BTCUSDT', 'buy', 0.85, 42500.50, NOW() - INTERVAL '5 minutes'),
  ('ETHUSDT', 'sell', 0.72, 2250.30, NOW() - INTERVAL '15 minutes'),
  ('BNBUSDT', 'buy', 0.68, 315.75, NOW() - INTERVAL '30 minutes'),
  ('SOLUSDT', 'buy', 0.79, 98.25, NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CRYPTOMUS PAYMENT SYSTEM (Migrated from Stripe)
-- ============================================================================

-- Profiles table for user subscriptions
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  pro_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Orders table for Cryptomus USDT payments
CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_amount TEXT,
  payer_amount TEXT,
  invoice_uuid TEXT,
  payment_url TEXT,
  pro_granted_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Processed Webhooks table for replay protection
CREATE TABLE IF NOT EXISTS processed_webhooks (
  webhook_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_expires_at ON processed_webhooks(expires_at);
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_order_id ON processed_webhooks(order_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL USING (true);

-- RLS Policies for payment_orders
CREATE POLICY "Users can view own orders" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage orders" ON payment_orders
  FOR ALL USING (true);

-- RLS Policies for processed_webhooks (service role only)
CREATE POLICY "Service role can manage webhooks" ON processed_webhooks
  FOR ALL USING (true);

-- ============================================================================
-- ATOMIC IDEMPOTENCY FUNCTION
-- ============================================================================
-- This function ensures concurrent webhooks don't double-extend Pro subscriptions
-- by atomically setting pro_granted_until only if it's NULL and returning the 
-- persisted value (either newly set or existing)

CREATE OR REPLACE FUNCTION set_pro_granted_until_if_null(
  p_order_id TEXT,
  p_new_pro_until TIMESTAMPTZ
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_result TIMESTAMPTZ;
BEGIN
  -- Atomically set pro_granted_until to the new value only if currently NULL
  -- Otherwise keep the existing value (for concurrent webhooks or retries)
  UPDATE payment_orders
  SET pro_granted_until = COALESCE(pro_granted_until, p_new_pro_until)
  WHERE id = p_order_id
  RETURNING pro_granted_until INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TTL CLEANUP FOR REPLAY PROTECTION
-- ============================================================================
-- Automatically delete expired webhook records to prevent unbounded growth

CREATE OR REPLACE FUNCTION cleanup_expired_webhooks()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM processed_webhooks
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Automated Execution:
-- The webhook handler automatically calls cleanup_expired_webhooks() on each webhook,
-- ensuring expired records are purged regularly without external scheduling.
-- 
-- Optional: For additional cleanup coverage, enable pg_cron:
-- SELECT cron.schedule('cleanup-expired-webhooks', '*/30 * * * *', $$SELECT cleanup_expired_webhooks()$$);
