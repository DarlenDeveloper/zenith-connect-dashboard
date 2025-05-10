import { supabase } from '@/integrations/supabase/client';

/**
 * Direct user action logging to userlogsorg table
 * Records actions with the current authenticated user ID
 */
export async function logUserAction(actionType: string, details: Record<string, any> = {}) {
  try {
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.id) {
      console.error('Cannot log action: No authenticated user found');
      return false;
    }
    
    // Get current selected user if available from session (or another source)
    let selectedUserId = null;
    try {
      // Try to get selectedUser from localStorage or session
      const selectedUserJson = localStorage.getItem('selectedUser');
      if (selectedUserJson) {
        const selectedUser = JSON.parse(selectedUserJson);
        selectedUserId = selectedUser?.id || null;
      }
    } catch (err) {
      console.error('Error getting selected user:', err);
    }
    
    // Create enhanced details with essential user context
    const enhancedDetails = {
      ...details,
      auth_user_id: user.id,                   // The logged-in admin/auth user
      selected_user_id: selectedUserId,        // The user they're acting as (if applicable)
      timestamp: new Date().toISOString()
    };
    
    // Insert the log entry - using the proper user_id field based on your requirements
    // Here we're using the authenticated user's ID as the primary user_id
    const { error } = await supabase
      .from('userlogsorg')
      .insert({
        user_id: user.id,                      // The primary user associated with this log
        action_type: actionType.toUpperCase(),
        details: enhancedDetails
      });
    
    if (error) {
      console.error('Failed to log user action:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in logging user action:', err);
    return false;
  }
}

// Common action types for the application
export const LogActions = {
  VIEW_PAGE: 'VIEW_PAGE',
  CREATE_ITEM: 'CREATE_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  USER_SELECTED: 'USER_SELECTED',
  ACTION_PERFORMED: 'ACTION_PERFORMED',
  SYSTEM_EVENT: 'SYSTEM_EVENT'
}; 