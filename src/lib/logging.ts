import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface LogActionParams {
  userId: string; // Must be passed explicitly as context might not be available everywhere
  actionType: string; // e.g., 'UPDATE_CALL_NOTES'
  details?: Record<string, any>; // Any extra JSON details
}

/**
 * Logs an action performed by a user.
 */
export const logAction = async ({
  userId,
  actionType,
  details,
}: LogActionParams): Promise<{ success: boolean; error?: any }> => {
  if (!userId) {
    console.error("LogAction Error: userId is required.");
    return { success: false, error: new Error("User ID is required for logging actions.") };
  }
  if (!actionType) {
    console.error("LogAction Error: actionType is required.");
    return { success: false, error: new Error("Action type is required for logging actions.") };
  }

  try {
    // DIRECT INSERT using SQL to bypass RLS for logging
    // This is more reliable than depending on RLS policies
    const { error } = await supabase.rpc('insert_user_log', {
      p_user_id: userId,
      p_action_type: actionType,
      p_details: details
    });

    if (error) {
      throw error;
    }

    console.log("Action logged successfully:", { actionType, userId });
    return { success: true };

  } catch (error: any) {
    console.error("Failed to log action:", error);
    return { success: false, error };
  }
}; 