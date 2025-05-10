-- Create call_duration_stats table
CREATE TABLE IF NOT EXISTS public.call_duration_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- Owner user
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_calls INTEGER NOT NULL DEFAULT 0,
  total_duration_minutes INTEGER NOT NULL DEFAULT 0,
  avg_duration_minutes NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, period_start, period_end)
);

-- Add RLS policies
ALTER TABLE public.call_duration_stats ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own stats
CREATE POLICY "Users can see their own call stats"
  ON public.call_duration_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a trigger to set the updated_at timestamp
CREATE TRIGGER update_call_duration_stats_timestamp
BEFORE UPDATE ON public.call_duration_stats
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Function to calculate average call duration for a given period
CREATE OR REPLACE FUNCTION calculate_avg_call_duration(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_calls INTEGER;
  v_total_duration NUMERIC;
  v_avg_duration NUMERIC(10, 2);
BEGIN
  -- Calculate statistics from calls table
  SELECT 
    COUNT(*),
    COALESCE(SUM(EXTRACT(EPOCH FROM (duration::INTERVAL)) / 60), 0)
  INTO 
    v_total_calls,
    v_total_duration
  FROM 
    calls
  WHERE 
    user_id = p_user_id
    AND call_datetime::DATE BETWEEN p_start_date AND p_end_date
    AND duration IS NOT NULL;
    
  -- Calculate average duration
  IF v_total_calls > 0 THEN
    v_avg_duration := v_total_duration / v_total_calls;
  ELSE
    v_avg_duration := 0;
  END IF;
  
  -- Store the stats in the call_duration_stats table
  INSERT INTO call_duration_stats (
    user_id,
    period_start,
    period_end,
    total_calls,
    total_duration_minutes,
    avg_duration_minutes
  ) VALUES (
    p_user_id,
    p_start_date,
    p_end_date,
    v_total_calls,
    v_total_duration,
    v_avg_duration
  )
  ON CONFLICT (user_id, period_start, period_end)
  DO UPDATE SET
    total_calls = EXCLUDED.total_calls,
    total_duration_minutes = EXCLUDED.total_duration_minutes,
    avg_duration_minutes = EXCLUDED.avg_duration_minutes,
    updated_at = now();
    
  RETURN v_avg_duration;
END;
$$;

-- Function to get the average call duration for the current month
CREATE OR REPLACE FUNCTION get_current_month_avg_duration(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
  v_avg_duration NUMERIC;
BEGIN
  -- Set period to current month
  v_start_date := date_trunc('month', CURRENT_DATE)::DATE;
  v_end_date := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
  
  -- Get the statistics
  SELECT avg_duration_minutes INTO v_avg_duration
  FROM call_duration_stats
  WHERE 
    user_id = p_user_id
    AND period_start = v_start_date
    AND period_end = v_end_date;
    
  -- If no stats exist yet, calculate them
  IF v_avg_duration IS NULL THEN
    v_avg_duration := calculate_avg_call_duration(p_user_id, v_start_date, v_end_date);
  END IF;
  
  RETURN v_avg_duration;
END;
$$;

-- Create a trigger to update call stats when a call is added or updated
CREATE OR REPLACE FUNCTION update_call_stats_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Set period to the month of the call
  v_start_date := date_trunc('month', NEW.call_datetime)::DATE;
  v_end_date := (date_trunc('month', NEW.call_datetime) + INTERVAL '1 month - 1 day')::DATE;
  
  -- Recalculate the stats
  PERFORM calculate_avg_call_duration(NEW.user_id, v_start_date, v_end_date);
  
  RETURN NEW;
END;
$$;

-- Create trigger on calls table
CREATE TRIGGER update_call_stats_after_change
AFTER INSERT OR UPDATE ON calls
FOR EACH ROW
EXECUTE FUNCTION update_call_stats_on_change();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.call_duration_stats TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_avg_call_duration TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_month_avg_duration TO authenticated; 