-- Function to get the next agent sequence number for the current user
CREATE OR REPLACE FUNCTION get_next_agent_sequence()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  next_sequence INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(agent_ref_id FROM '^[A-Z]+(\d+)$') AS INT)), 0) + 1
  INTO next_sequence
  FROM agents
  WHERE user_id = current_user_id
  AND agent_ref_id ~ '^[A-Z]+\d+$'; -- Ensure it matches the pattern before trying to cast

  RETURN next_sequence;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_next_agent_sequence() TO authenticated; 