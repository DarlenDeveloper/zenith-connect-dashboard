-- Migration to fix userlogsorg access issues
-- This script adds necessary RLS policies and a function to bypass RLS for logging

-- 1. Make sure the userlogsorg table exists
CREATE TABLE IF NOT EXISTS userlogsorg (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Make sure index exists
CREATE INDEX IF NOT EXISTS idx_userlogsorg_user_id ON userlogsorg(user_id);

-- 3. Enable RLS if not already enabled
ALTER TABLE userlogsorg ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own logs" ON userlogsorg;
DROP POLICY IF EXISTS "Users can view their own logs" ON userlogsorg;
DROP POLICY IF EXISTS "Service role can access all logs" ON userlogsorg;

-- 5. Add RLS policies with proper access
CREATE POLICY "Users can insert their own logs" 
ON userlogsorg
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own logs" 
ON userlogsorg
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can access all logs"
ON userlogsorg
USING (true);

-- 6. Create stored procedure to insert log entries that bypass RLS
DROP FUNCTION IF EXISTS insert_user_log;

CREATE OR REPLACE FUNCTION insert_user_log(
    p_user_id UUID,
    p_action_type TEXT,
    p_details JSONB DEFAULT NULL
) RETURNS VOID
SECURITY DEFINER -- This makes it run with the privileges of the function creator
AS $$
BEGIN
    INSERT INTO userlogsorg (user_id, action_type, details)
    VALUES (p_user_id, p_action_type, p_details);
END;
$$ LANGUAGE plpgsql;

-- 7. Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION insert_user_log TO authenticated;
GRANT EXECUTE ON FUNCTION insert_user_log TO anon;

-- 8. Update schema cache
SELECT pg_notify('pgrst', 'reload schema cache'); 