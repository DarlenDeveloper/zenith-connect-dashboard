// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hytudwviatqbtwnlqsdl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5dHVkd3ZpYXRxYnR3bmxxc2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyODAyMjgsImV4cCI6MjA1ODg1NjIyOH0.FMuK2-YWUe3t9PSU-_xeFE1vcY0-CBkhhfgsOSFnlYA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);