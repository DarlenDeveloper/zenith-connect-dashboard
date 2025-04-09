-- Add email column to agents table
ALTER TABLE agents
ADD COLUMN email TEXT;

-- Optional: Add a unique constraint if email should be unique per user/org
-- ALTER TABLE agents
-- ADD CONSTRAINT agent_email_owner_unique UNIQUE (user_id, email);

-- Optional: Add index for faster email lookups
CREATE INDEX idx_agents_email ON agents(email); 