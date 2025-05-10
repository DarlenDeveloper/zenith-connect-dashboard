-- Create a simple table just for call durations in minutes
CREATE TABLE IF NOT EXISTS public.call_durations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- Auth user ID
  duration_minutes FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policy for proper user isolation
ALTER TABLE public.call_durations ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own duration records
CREATE POLICY "Users can see their own call durations"
  ON public.call_durations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own call durations"
  ON public.call_durations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT ON public.call_durations TO authenticated; 