import { supabase } from '@/integrations/supabase/client';

/**
 * Log a user action to userlogsorg table
 */
export const logUserAction = async (
  userId: string,
  actionType: string,
  details?: Record<string, any> | null
) => {
  try {
    const { data, error } = await supabase
      .from('userlogsorg')
      .insert({
        user_id: userId,
        action_type: actionType,
        details: details || null
      });

    if (error) {
      console.error('Failed to log user action:', error);
    }

    return { data, error };
  } catch (err) {
    console.error('Error logging user action:', err);
    return { data: null, error: err };
  }
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
}; 