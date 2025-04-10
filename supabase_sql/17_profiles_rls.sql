-- Enable RLS on the profiles table if not already enabled.
-- Run this only once, typically when first creating the table.
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- (Check Supabase dashboard under Authentication -> Policies -> profiles to see if enabled)

-- Policy: Allow users to read their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles
FOR SELECT 
USING (auth.uid() = id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles
FOR UPDATE 
USING (auth.uid() = id) -- Ensures they can only target their own row
WITH CHECK (auth.uid() = id); -- Ensures they can't change the id to someone else's 