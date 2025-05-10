-- Simple action_logs table with user ID tracking

-- Drop the table first if it exists to avoid errors
DROP TABLE IF EXISTS action_logs;

CREATE TABLE action_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL, -- The currently logged in user
  action_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Simple index with IF NOT EXISTS to avoid errors
CREATE INDEX IF NOT EXISTS idx_action_logs_user_id ON action_logs(user_id);

-- Update schema cache
SELECT pg_notify('pgrst', 'reload schema cache'); 