-- Create the calls table (using user_id as the organization identifier)
CREATE TABLE calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Link directly to the authenticated user (acting as org)
  caller_number TEXT,
  call_datetime TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'Unresolved' NOT NULL, -- e.g., Unresolved, Resolved, Needs Review
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for faster querying
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_datetime ON calls(call_datetime DESC);

-- Enable RLS
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own calls (user_id is the ownership key)
CREATE POLICY "Users can manage their own calls" 
ON calls
FOR ALL
USING (user_id = auth.uid()) -- Check if the row's user_id matches the logged-in user
WITH CHECK (user_id = auth.uid()); -- Ensure inserts/updates also match the logged-in user

-- Ensure you add 'org_id' to the app_metadata when users sign up or log in.
-- Example signup metadata: { "org_id": "your_org_uuid" } 