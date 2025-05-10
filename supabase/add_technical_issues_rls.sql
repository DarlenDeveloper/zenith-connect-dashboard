-- Enable RLS on technical_issues table if not already enabled
ALTER TABLE technical_issues ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all technical issues
CREATE POLICY "Allow users to view technical issues"
    ON technical_issues
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert technical issues
CREATE POLICY "Allow users to insert technical issues"
    ON technical_issues
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reported_by);

-- Allow authenticated users to update technical issues
CREATE POLICY "Allow users to update technical issues"
    ON technical_issues
    FOR UPDATE
    TO authenticated
    USING (true);

-- Allow authenticated users to delete technical issues
CREATE POLICY "Allow users to delete technical issues"
    ON technical_issues
    FOR DELETE
    TO authenticated
    USING (true);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON technical_issues TO authenticated; 