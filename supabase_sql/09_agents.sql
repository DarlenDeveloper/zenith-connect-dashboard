-- Create the agents table
CREATE TABLE agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- User who owns/manages this agent list (acting as org)
  agent_ref_id TEXT NOT NULL UNIQUE, -- The user-defined ID like AUD0001
  name TEXT NOT NULL,
  phone_number TEXT, -- Optional
  is_active BOOLEAN DEFAULT true NOT NULL,
  -- auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional: Link if agents have their own logins
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT agent_ref_id_owner_unique UNIQUE (user_id, agent_ref_id) -- Ensure Agent Ref ID is unique *within* an organization
);

-- Add indexes
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_agent_ref_id ON agents(agent_ref_id);

-- Use the existing trigger function to update updated_at timestamp
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON agents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Allow users to view agents associated with their user_id
CREATE POLICY "Users can view their own agents" 
ON agents
FOR SELECT
USING (user_id = auth.uid());

-- Allow users (acting as admin for their org) to manage their own agents
-- NOTE: This assumes the logged-in user IS the admin for their agents.
-- A proper admin role check would be needed for multi-user orgs.
CREATE POLICY "Users can manage their own agents" 
ON agents
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid()); 