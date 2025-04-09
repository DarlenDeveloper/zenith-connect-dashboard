-- Create the technical_issues table (using user_id as the organization identifier)
CREATE TABLE technical_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- User who owns this issue (acting as org)
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Still useful: the specific user who *flagged* it
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'Open' NOT NULL, -- e.g., Open, In Progress, Resolved
  priority TEXT DEFAULT 'Medium' NOT NULL, -- e.g., Low, Medium, High
  resolution TEXT, -- Notes on how it was resolved
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX idx_tech_issues_user_id ON technical_issues(user_id);
CREATE INDEX idx_tech_issues_call_id ON technical_issues(call_id);
CREATE INDEX idx_tech_issues_status ON technical_issues(status);

-- Enable RLS
ALTER TABLE technical_issues ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own technical issues
CREATE POLICY "Users can manage their own tech issues" 
ON technical_issues
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid()); 