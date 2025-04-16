-- Add PIN column to agents table
ALTER TABLE agents ADD COLUMN pin VARCHAR(4);

-- Update any existing agents with a default PIN
-- In production, you would want to set unique PINs for each agent
UPDATE agents SET pin = '1234' WHERE pin IS NULL;

-- Make PIN column NOT NULL after setting defaults
ALTER TABLE agents ALTER COLUMN pin SET NOT NULL;

-- Comment explaining the purpose
COMMENT ON COLUMN agents.pin IS 'Four-digit PIN for agent authentication'; 