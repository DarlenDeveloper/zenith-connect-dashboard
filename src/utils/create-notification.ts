import { supabase } from "@/integrations/supabase/client";

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  targetTable?: string;
  targetId?: string;
}

/**
 * Creates a new notification in the database
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  targetTable,
  targetId,
}: CreateNotificationParams) => {
  try {
    const { data, error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      is_read: false,
      target_table: targetTable || null,
      target_id: targetId || null,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Exception creating notification:", err);
    return { success: false, error: err };
  }
}; 