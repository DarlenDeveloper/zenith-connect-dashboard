-- Function to get overview stats for the logged-in user
CREATE OR REPLACE FUNCTION get_analytics_overview()
RETURNS TABLE (total_calls BIGINT, resolved_calls BIGINT, resolution_rate NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Allows function to bypass RLS temporarily
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_calls,
    COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved_calls,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE (COUNT(*) FILTER (WHERE status = 'Resolved')::NUMERIC * 100.0 / COUNT(*)::NUMERIC)
    END AS resolution_rate
  FROM calls
  WHERE calls.user_id = current_user_id;
END;
$$;

-- Function to get call counts for the last N days for the logged-in user
CREATE OR REPLACE FUNCTION get_daily_call_counts(days_count INT DEFAULT 7)
RETURNS TABLE (call_day DATE, call_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      (current_date - (days_count - 1) * interval '1 day')::date,
      current_date::date,
      '1 day'::interval
    )::date AS day
  )
  SELECT
    ds.day AS call_day,
    COUNT(c.id) AS call_count
  FROM date_series ds
  LEFT JOIN calls c ON c.call_datetime::date = ds.day AND c.user_id = current_user_id
  GROUP BY ds.day
  ORDER BY ds.day ASC;
END;
$$;

-- Function to get call counts by status for the logged-in user
CREATE OR REPLACE FUNCTION get_calls_by_status()
RETURNS TABLE (status TEXT, status_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
    c.status,
    COUNT(*) AS status_count
  FROM calls c
  WHERE c.user_id = current_user_id
  GROUP BY c.status;
END;
$$;

-- Grant execution permission to the authenticated role
-- Note: SECURITY DEFINER functions run as the user who DEFINED them (usually postgres),
-- but we still need to grant the ability for logged-in users (authenticated role)
-- to EXECUTE these functions.
GRANT EXECUTE ON FUNCTION get_analytics_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_call_counts(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_calls_by_status() TO authenticated; 