-- Create the system_status table
CREATE TABLE system_status (
  id TEXT PRIMARY KEY, -- Use a unique identifier for the component, e.g., 'ai_voice', 'dashboard', 'call_processing'
  component_name TEXT NOT NULL, -- User-friendly name, e.g., 'AI Voice Service'
  status TEXT DEFAULT 'Operational' NOT NULL, -- e.g., Operational, Degraded, Outage
  message TEXT, -- Optional message providing more details
  last_updated TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Make table publically readable (no RLS needed usually for status)
-- ALTER TABLE system_status ENABLE ROW LEVEL SECURITY; -- Keep RLS disabled
-- CREATE POLICY "Allow public read access" ON system_status FOR SELECT USING (true);

-- Optional: Add trigger for last_updated
-- CREATE OR REPLACE FUNCTION update_updated_at_column()... (if not already created)
CREATE TRIGGER update_system_status_updated_at
BEFORE UPDATE ON system_status
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default statuses (example)
INSERT INTO system_status (id, component_name, status) VALUES
  ('dashboard', 'Dashboard & UI', 'Operational'),
  ('call_processing', 'Call Processing', 'Operational'),
  ('ai_voice', 'AI Voice Service', 'Operational')
ON CONFLICT (id) DO NOTHING; 