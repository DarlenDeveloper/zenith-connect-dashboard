-- Add a foreign key constraint from action_logs.acting_agent_id to users.id
ALTER TABLE action_logs
  ADD CONSTRAINT fk_action_logs_acting_agent_id
  FOREIGN KEY (acting_agent_id)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- Create a foreign key relationship comment to help Supabase understand the relationship
COMMENT ON CONSTRAINT fk_action_logs_acting_agent_id ON action_logs IS 'Foreign key relationship from action_logs.acting_agent_id to users.id';

-- Update the schema cache to refresh relationships
SELECT pg_notify('pgrst', 'reload schema cache'); 