-- Create a function to get average call duration from the call_durations table
CREATE OR REPLACE FUNCTION get_average_call_duration(p_user_id UUID)
RETURNS FLOAT
LANGUAGE plpgsql
AS $$
DECLARE
  v_avg_duration FLOAT;
BEGIN
  -- Calculate average duration from the call_durations table
  SELECT 
    COALESCE(AVG(duration_minutes), 0)
  INTO 
    v_avg_duration
  FROM 
    call_durations
  WHERE 
    user_id = p_user_id;
    
  RETURN v_avg_duration;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_average_call_duration TO authenticated; 