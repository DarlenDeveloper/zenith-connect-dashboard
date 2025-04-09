-- Add acting_agent_id column to technical_issues table (Nullable)
ALTER TABLE technical_issues
ADD COLUMN acting_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX idx_tech_issues_acting_agent_id ON technical_issues(acting_agent_id); 