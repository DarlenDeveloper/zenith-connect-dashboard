import { supabase } from '@/integrations/supabase/client';

/**
 * Log an action with the current user ID
 */
export const logAction = async (
  actionType: string,
  userId: string,
  details?: Record<string, any> | null
) => {
  try {
    // Check if we have service role access - this would allow bypassing RLS
    const supClient = supabase;
    
    const { data, error } = await supClient
      .from('userlogsorg')
      .insert({
        user_id: userId,
        action_type: actionType,
        details: details || null
      });

    if (error) {
      console.error('Failed to log action:', error);
      // If there was an error, it might be due to RLS - log more details for debugging
      console.log('Error details:', { userId, actionType, error });
    }

    return { data, error };
  } catch (err) {
    console.error('Error logging action:', err);
    return { data: null, error: err };
  }
};

/**
 * Legacy function for backward compatibility
 * Use logAction instead for new code
 */
export const logUserAction = async (
  actionType: string,
  userId: string,
  actingUserId?: string | null,
  targetTable?: string | null,
  targetId?: string | null,
  details?: Record<string, any> | null
) => {
  // Combine all the data into a single details object to preserve information
  const combinedDetails = {
    ...details,
    ...(actingUserId ? { actingUserId } : {}),
    ...(targetTable ? { targetTable } : {}),
    ...(targetId ? { targetId } : {})
  };

  // Call the new function with the combined details
  return logAction(actionType, userId, combinedDetails);
};

/**
 * Common action types
 */
export const ActionTypes = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW'
} as const;

export type ActionType = typeof ActionTypes[keyof typeof ActionTypes]; 