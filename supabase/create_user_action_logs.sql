-- Create a new user_action_logs table instead of modifying the existing one

-- 1. Create the new user_action_logs table
CREATE TABLE IF NOT EXISTS user_action_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acting_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_action_logs_user_id ON user_action_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_action_logs_acting_user_id ON user_action_logs(acting_user_id);
CREATE INDEX IF NOT EXISTS idx_user_action_logs_created_at ON user_action_logs(created_at);

-- 3. Add comments for documentation
COMMENT ON TABLE user_action_logs IS 'Logs of actions performed by users in the system';
COMMENT ON COLUMN user_action_logs.user_id IS 'Reference to the user who owns the record (from auth.users)';
COMMENT ON COLUMN user_action_logs.acting_user_id IS 'Reference to the user who performed the action (from users table)';
COMMENT ON COLUMN user_action_logs.action_type IS 'Type of action performed (e.g., CREATE_USER, UPDATE_CALL_STATUS)';
COMMENT ON COLUMN user_action_logs.target_table IS 'Table affected by the action, if applicable';
COMMENT ON COLUMN user_action_logs.target_id IS 'ID of the specific record affected, if applicable';
COMMENT ON COLUMN user_action_logs.details IS 'Additional details about the action in JSON format';

-- 4. Add Row-Level Security (RLS) policies
ALTER TABLE user_action_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own logs
CREATE POLICY "Users can view their own logs"
  ON user_action_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own logs
CREATE POLICY "Users can insert their own logs"
  ON user_action_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Update the schema cache
SELECT pg_notify('pgrst', 'reload schema cache'); 