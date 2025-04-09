-- Create the ai_voice_requests table
CREATE TABLE ai_voice_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- User (acting as org) making the request
  request_type TEXT NOT NULL, -- e.g., 'New Number', 'Change Voice', 'Update Details', 'Other'
  details TEXT NOT NULL, -- Description and specific details of the request
  status TEXT DEFAULT 'Pending' NOT NULL, -- e.g., Pending, In Progress, Completed, Rejected
  resolution_notes TEXT, -- Optional notes from admin/support on resolution
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX idx_ai_requests_user_id ON ai_voice_requests(user_id);
CREATE INDEX idx_ai_requests_status ON ai_voice_requests(status);
CREATE INDEX idx_ai_requests_created_at ON ai_voice_requests(created_at DESC);

-- Use the existing trigger function to update updated_at timestamp (if you created it for payments)
-- CREATE OR REPLACE FUNCTION update_updated_at_column()... 
CREATE TRIGGER update_ai_requests_updated_at
BEFORE UPDATE ON ai_voice_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE ai_voice_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own AI voice requests
CREATE POLICY "Users can manage their own AI voice requests" 
ON ai_voice_requests
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins/Support might need broader access policies (not defined here) 