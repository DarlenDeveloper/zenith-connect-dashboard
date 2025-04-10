import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface LogActionParams {
  userId: string; // Must be passed explicitly as context might not be available everywhere
  agentId: string | null; // The currently selected agent ID
  actionType: string; // e.g., 'UPDATE_CALL_NOTES'
  targetTable?: string; // e.g., 'calls'
  targetId?: string; // e.g., the UUID of the call record
  details?: Record<string, any>; // Any extra JSON details
}

/**
 * Logs an action performed by a user, potentially associated with an agent.
 */
export const logAction = async ({
  userId,
  agentId,
  actionType,
  targetTable,
  targetId,
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
    const { error } = await supabase.from("action_logs").insert({
      user_id: userId,
      acting_agent_id: agentId, // Can be null if no agent is selected/relevant
      action_type: actionType,
      target_table: targetTable,
      target_id: targetId, // Ensure this is UUID if target table uses UUID PK
      details: details,
    });

    if (error) {
      throw error;
    }

    console.log("Action logged successfully:", { actionType, agentId, targetTable, targetId });
    return { success: true };

  } catch (error: any) {
    console.error("Failed to log action:", error);
    return { success: false, error };
  }
}; 