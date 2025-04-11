-- Function to create notifications for all users about a new announcement.
CREATE OR REPLACE FUNCTION public.handle_new_announcement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Check if the announcement is being published in this operation
  -- TG_OP is 'INSERT' or 'UPDATE'. Check if is_published is true.
  -- For UPDATE, optionally check if is_published changed from false to true:
  -- IF TG_OP = 'UPDATE' AND OLD.is_published = false AND NEW.is_published = true THEN ...
  -- IF TG_OP = 'INSERT' AND NEW.is_published = true THEN ...
  
  IF NEW.is_published = true THEN
    -- Optionally add a check for UPDATEs to only run if is_published *changed* to true
    -- IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.is_published = false) THEN
    
      -- Loop through all users in auth.users
      FOR user_record IN SELECT id FROM auth.users LOOP
        -- Insert a notification for each user
        INSERT INTO public.notifications (user_id, type, title, message, target_table, target_id)
        VALUES (
          user_record.id,
          'announcement', -- Notification type
          NEW.title, -- Use announcement title
          LEFT(NEW.content, 100), -- Use first 100 chars of content as message (optional)
          'announcements', -- Target table
          NEW.id -- Target ID (the announcement's ID)
        );
      END LOOP;
    
    -- END IF; -- End optional check for UPDATE change
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to call the function after an announcement is inserted or updated.
CREATE OR REPLACE TRIGGER on_announcement_published
  AFTER INSERT OR UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_announcement();

-- Optional: Grant usage (usually not needed for SECURITY DEFINER)
-- GRANT EXECUTE ON FUNCTION public.handle_new_announcement() TO authenticated; 