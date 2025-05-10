-- Migration to update action_logs table to use users instead of agents

-- 1. First, add the new acting_user_id column
ALTER TABLE action_logs
ADD COLUMN acting_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2. Create a function to copy acting_agent_id data to acting_user_id
-- This assumes there's a way to map agent IDs to user IDs
-- You'll need to adapt this based on your actual data model and relationships
CREATE OR REPLACE FUNCTION migrate_agent_to_user() RETURNS void AS $$
DECLARE 
  log_record RECORD;
BEGIN
  FOR log_record IN SELECT * FROM action_logs WHERE acting_agent_id IS NOT NULL LOOP
    -- This is a simplified example. In reality, you would need to:
    -- 1. Find the corresponding user_id for each agent_id
    -- 2. Update the acting_user_id with the corresponding user_id
    -- Example (assuming agents have a user_id column pointing to users):
    UPDATE action_logs 
    SET acting_user_id = (SELECT user_id FROM agents WHERE id = log_record.acting_agent_id)
    WHERE id = log_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Execute the migration function
SELECT migrate_agent_to_user();

-- 4. Once data is migrated, drop the old column and function
ALTER TABLE action_logs DROP COLUMN acting_agent_id;
DROP FUNCTION migrate_agent_to_user();

-- 5. Update indexes
DROP INDEX IF EXISTS idx_action_logs_acting_agent_id;
CREATE INDEX idx_action_logs_acting_user_id ON action_logs(acting_user_id);

-- 6. Add comment to explain the change
COMMENT ON COLUMN action_logs.acting_user_id IS 'Reference to the user who performed the action. Previously referenced agents table.'; 