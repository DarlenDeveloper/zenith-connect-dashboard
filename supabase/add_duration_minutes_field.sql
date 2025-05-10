-- Add duration_minutes field to calls table
ALTER TABLE public.calls 
ADD COLUMN IF NOT EXISTS duration_minutes FLOAT DEFAULT NULL;

-- Create a function to calculate the average duration
CREATE OR REPLACE FUNCTION get_average_call_duration(p_user_id UUID)
RETURNS FLOAT
LANGUAGE SQL
AS $$
  SELECT AVG(duration_minutes)
  FROM calls
  WHERE user_id = p_user_id
  AND duration_minutes IS NOT NULL;
$$;

-- Grant permission to use the function
GRANT EXECUTE ON FUNCTION get_average_call_duration TO authenticated; 