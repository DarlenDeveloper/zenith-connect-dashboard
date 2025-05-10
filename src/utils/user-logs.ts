import { supabase } from '@/integrations/supabase/client';

/**
 * Log a user action with both user IDs and reference IDs
 * This function logs directly to the userlogsorg table using the selected user's ID as the primary user_id
 */
export async function logUserAction(
  actionType: string, 
  details: Record<string, any> = {}
): Promise<boolean> {
  try {
    console.log(`Logging action: ${actionType}`, details);
    
    // Get current authenticated user from supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.id) {
      console.error('Cannot log action: No authenticated user found');
      return false;
    }
    
    // Try to get selected user from session storage - this is the actual user we want to log for
    let selectedUserId = null;
    let selectedUserRefId = null;
    let selectedUserName = null;
    
    try {
      const selectedUserJson = sessionStorage.getItem('selectedUserId');
      if (selectedUserJson) {
        selectedUserId = selectedUserJson;
        console.log(`Found selected user ID: ${selectedUserId}`);
        
        // Fetch the user details to get user_ref_id
        const { data: userData } = await supabase
          .from('users')
          .select('user_ref_id, name')
          .eq('id', selectedUserId)
          .single();
          
        if (userData) {
          selectedUserRefId = userData.user_ref_id;
          selectedUserName = userData.name;
          console.log(`Selected user ref: ${selectedUserRefId}, name: ${selectedUserName}`);
        }
      } else {
        console.log('No selected user found in session storage');
      }
    } catch (err) {
      console.error('Error getting selected user:', err);
    }
    
    // Get auth user's details (the admin/staff who's actually performing the action)
    let authUserRefId = null;
    let authUserName = null;
    
    try {
      const { data: authUserData } = await supabase
        .from('users')
        .select('user_ref_id, name')
        .eq('user_id', user.id)
        .single();
        
      if (authUserData) {
        authUserRefId = authUserData.user_ref_id;
        authUserName = authUserData.name;
      }
    } catch (err) {
      console.error('Error getting auth user details:', err);
    }
    
    // Create enhanced details with all relevant user information
    const enhancedDetails = {
      ...details,
      auth_user_id: user.id,
      auth_user_ref_id: authUserRefId,
      auth_user_name: authUserName,
      timestamp: new Date().toISOString()
    };
    
    console.log('Inserting log with details:', {
      user_id: selectedUserId || user.id,
      action_type: actionType.toUpperCase(),
      details: enhancedDetails
    });
    
    // Insert the log entry
    // Important: user_id is the selected user's ID, not the auth account
    const { data, error } = await supabase
      .from('userlogsorg')
      .insert({
        // Use the selected user's ID as the primary user_id if available
        // Otherwise fall back to the auth user ID
        user_id: selectedUserId || user.id,
        action_type: actionType.toUpperCase(),
        details: enhancedDetails
      });
    
    if (error) {
      console.error('Failed to log user action:', error);
      return false;
    }
    
    console.log('Successfully logged action:', actionType, data);
    return true;
  } catch (err) {
    console.error('Error in logging user action:', err);
    return false;
  }
}

// Common action types for the application
export const LogActions = {
  // Page actions
  VIEW_PAGE: 'VIEW_PAGE',
  
  // Item actions
  CREATE_ITEM: 'CREATE_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
  
  // Auth actions
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  
  // User actions
  USER_SELECTED: 'USER_SELECTED',
  USER_AUTHENTICATED: 'USER_AUTHENTICATED',
  UPDATE_USER_PROFILE: 'UPDATE_USER_PROFILE',
  
  // Technical issue actions
  RESOLVE_TECHNICAL_ISSUE: 'RESOLVE_TECHNICAL_ISSUE',
  DELETE_TECHNICAL_ISSUE: 'DELETE_TECHNICAL_ISSUE',
  FLAG_TECHNICAL_ISSUE: 'FLAG_TECHNICAL_ISSUE',
  
  // Call actions
  UPDATE_CALL_STATUS: 'UPDATE_CALL_STATUS',
  SAVE_CALL_NOTES: 'SAVE_CALL_NOTES',
  DELETE_CALL: 'DELETE_CALL',
  
  // Misc
  ACTION_PERFORMED: 'ACTION_PERFORMED',
  SYSTEM_EVENT: 'SYSTEM_EVENT'
}; 