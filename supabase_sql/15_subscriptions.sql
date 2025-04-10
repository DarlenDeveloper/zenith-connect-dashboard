-- Table to store user subscription details
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- Each user has only one active subscription entry
  plan_id TEXT NOT NULL, -- e.g., 'starter', 'pro', 'enterprise'
  status TEXT NOT NULL, -- e.g., 'active', 'canceled', 'incomplete', 'past_due'
  current_period_start TIMESTAMPTZ NOT NULL, -- When the current billing cycle started
  current_period_end TIMESTAMPTZ NOT NULL, -- When the current billing cycle ends (and renewal/expiry happens)
  cancel_at_period_end BOOLEAN DEFAULT false NOT NULL, -- Flag if user requested cancellation at period end
  canceled_at TIMESTAMPTZ, -- Timestamp when the subscription was definitively canceled
  metadata JSONB, -- Optional: Store extra info like Flutterwave sub ID if available
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Use the existing trigger function for updated_at
-- Ensure the function update_updated_at_column() created in 04_payments.sql exists
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own subscription
CREATE POLICY "Users can view their own subscription"
ON subscriptions
FOR SELECT
USING (user_id = auth.uid());

-- Allow backend (webhook/function) to manage subscriptions (using service key)
-- Service roles bypass RLS by default, so an explicit policy might not be strictly necessary
-- but can be added for clarity or more granular control if needed.
-- Example Policy (adjust as needed):
-- CREATE POLICY "Allow service role to manage subscriptions"
-- ON subscriptions
-- FOR ALL
-- USING (true) -- Or more specific checks if needed
-- WITH CHECK (true); 