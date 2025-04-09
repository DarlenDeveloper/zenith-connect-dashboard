-- Create the announcements table
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  published_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX idx_announcements_published_at ON announcements(published_at DESC NULLS LAST);
CREATE INDEX idx_announcements_is_published ON announcements(is_published);

-- Enable RLS (Optional, but good practice)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read published announcements
CREATE POLICY "Allow read access to published announcements" 
ON announcements
FOR SELECT 
USING (is_published = true);

-- Note: You'll need an admin role or service key to insert/update/publish announcements.
-- Example policy for an admin role (if using custom claims):
-- CREATE POLICY "Allow admin to manage announcements" 
-- ON announcements
-- FOR ALL 
-- USING (auth.jwt() ->> 'app_metadata' ->> 'role' = 'admin')
-- WITH CHECK (auth.jwt() ->> 'app_metadata' ->> 'role' = 'admin'); 