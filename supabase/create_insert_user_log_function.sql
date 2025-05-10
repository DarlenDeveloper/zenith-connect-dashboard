-- Create a stored procedure to insert log entries that bypass RLS

-- Drop function if exists
DROP FUNCTION IF EXISTS insert_user_log;

-- Create function to insert into userlogsorg table
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_user_log TO authenticated;
GRANT EXECUTE ON FUNCTION insert_user_log TO anon;

-- Update schema cache
SELECT pg_notify('pgrst', 'reload schema cache'); 