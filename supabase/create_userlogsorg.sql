-- Simple userlogsorg table for tracking user actions

-- Create the table 
CREATE TABLE userlogsorg (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add index
CREATE INDEX idx_userlogsorg_user_id ON userlogsorg(user_id);

-- Enable RLS
ALTER TABLE userlogsorg ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can insert their own logs" 
ON userlogsorg
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own logs" 
ON userlogsorg
FOR SELECT
USING (auth.uid() = user_id);

-- Add policy for service role to bypass RLS
CREATE POLICY "Service role can access all logs"
ON userlogsorg
USING (true);

-- Update schema cache
SELECT pg_notify('pgrst', 'reload schema cache'); 