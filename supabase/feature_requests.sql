-- Create feature_requests table
CREATE TABLE IF NOT EXISTS public.feature_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for feature_requests
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own feature requests
CREATE POLICY "Users can view their own feature requests"
ON public.feature_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to insert their own feature requests
CREATE POLICY "Users can insert their own feature requests"
ON public.feature_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for admins to view all feature requests
CREATE POLICY "Admins can view all feature requests"
ON public.feature_requests
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policy for admins to update all feature requests
CREATE POLICY "Admins can update all feature requests"
ON public.feature_requests
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.feature_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add feature_requests to realtime publication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    profiles, 
    agents,
    calls,
    notifications,
    technical_issues,
    feature_requests;
COMMIT;

-- Add comment to table
COMMENT ON TABLE public.feature_requests IS 'Stores feature requests submitted by users';
