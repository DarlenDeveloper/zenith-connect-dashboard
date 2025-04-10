-- Function to create a profile entry for a new user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert a new row into the public.profiles table
  -- Uses the id and raw_user_meta_data from the newly inserted auth.users row
  INSERT INTO public.profiles (id, name, organization_name, phone_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',             -- Extract 'name'
    NEW.raw_user_meta_data ->> 'organizationName', -- Extract 'organizationName' (as stored in metadata)
    NEW.raw_user_meta_data ->> 'phoneNumber'       -- Extract 'phoneNumber' (as stored in metadata)
    -- Ensure the column names above (name, organization_name, phone_number) match your profiles table schema EXACTLY.
    -- Ensure the keys used in ->> ('name', 'organizationName', 'phoneNumber') match EXACTLY what's passed in options.data during signup.
  );
  RETURN NEW;
END;
$$;

-- Trigger to call the function after a new user signs up.
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant usage on the function (optional, depends on security setup, usually fine for SECURITY DEFINER)
-- GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated; 