-- Create a function to get average call duration from the calls table
CREATE OR REPLACE FUNCTION get_average_call_duration(p_user_id UUID)
RETURNS FLOAT
LANGUAGE plpgsql
AS $$
DECLARE
  v_avg_duration FLOAT;
BEGIN
  -- Calculate average duration from the calls table
  SELECT 
    COALESCE(AVG(EXTRACT(EPOCH FROM (duration::INTERVAL)) / 60), 0)
  INTO 
    v_avg_duration
  FROM 
    calls
  WHERE 
    user_id = p_user_id
    AND duration IS NOT NULL;
    
  RETURN v_avg_duration;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_average_call_duration TO authenticated; 