-- Create sequence for user reference IDs
CREATE SEQUENCE IF NOT EXISTS user_id_seq;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- Owner user
  user_ref_id VARCHAR(10) NOT NULL UNIQUE, -- Reference ID (e.g., USR0001)
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  pin VARCHAR(4) NOT NULL, -- 4-digit PIN for authentication
  role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin', 'user', etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function to get next user ID sequence
CREATE OR REPLACE FUNCTION get_next_user_sequence()
RETURNS INT
LANGUAGE SQL
AS $$
  SELECT nextval('user_id_seq')::INT;
$$;

-- Add RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only users belonging to their organization (user_id)
CREATE POLICY "Users can see their own users"
  ON public.users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own users
CREATE POLICY "Users can add their own users"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own users
CREATE POLICY "Users can update their own users"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own users
CREATE POLICY "Users can delete their own users"
  ON public.users
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a trigger to set the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Insert initial admin user (you would replace values with actual values)
-- This would typically be done in your application code after signup
-- INSERT INTO public.users (
--   user_id, 
--   user_ref_id, 
--   name, 
--   email, 
--   phone_number, 
--   pin, 
--   role
-- ) VALUES (
--   'auth-user-id-here', 
--   'ADM0001', 
--   'Admin User', 
--   'admin@example.com', 
--   '+1234567890', 
--   '1234', 
--   'admin'
-- ); 