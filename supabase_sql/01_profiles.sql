-- Create the public.profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  organization_name TEXT,
  phone_number TEXT,
  has_subscription BOOLEAN DEFAULT false,
  -- Add other profile-specific columns here if needed
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX idx_profiles_name ON public.profiles(name); -- Optional: if searching by name

-- Use the existing trigger function for updated_at 
-- (Ensure update_updated_at_column function from 04_payments.sql exists)
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments explaining the table and columns
COMMENT ON TABLE public.profiles IS 'Stores public profile information for users.';
COMMENT ON COLUMN public.profiles.id IS 'References the internalSupabase auth user id.';
COMMENT ON COLUMN public.profiles.has_subscription IS 'Tracks if the user has an active subscription (can be redundant).'; 