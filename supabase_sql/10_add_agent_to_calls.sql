-- Add agent_id column to calls table (Nullable)
ALTER TABLE calls
ADD COLUMN agent_id UUID REFERENCES agents(id) ON DELETE SET NULL;

-- Create an index for faster lookups by agent
CREATE INDEX idx_calls_agent_id ON calls(agent_id); 