import { supabase } from '@/integrations/supabase/client';

/**
 * Simple test function to log an activity
 * Run this from the browser console to test the logging system
 */
export const testLogActivity = async () => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return { success: false, error: 'Not authenticated' };
    }
    
    console.log('Logging test activity for user:', user.id);
    
    // Try direct table insert first
    const { error: directError } = await supabase
      .from('userlogsorg')
      .insert({
        user_id: user.id,
        action_type: 'TEST_ACTIVITY',
        details: { 
          source: 'test-logging.ts',
          timestamp: new Date().toISOString(),
          test: true 
        }
      });
      
    if (directError) {
      console.warn('Direct insert failed:', directError.message);
      
      // Try using RPC function as fallback
      const { error: rpcError } = await supabase.rpc('insert_user_log', {
        p_user_id: user.id,
        p_action_type: 'TEST_ACTIVITY_RPC',
        p_details: { 
          source: 'test-logging.ts via RPC',
          timestamp: new Date().toISOString(),
          test: true 
        }
      });
      
      if (rpcError) {
        console.error('RPC insert failed:', rpcError.message);
        return { success: false, error: rpcError };
      }
      
      console.log('Activity logged via RPC function');
      return { success: true, method: 'rpc' };
    }
    
    console.log('Activity logged directly');
    return { success: true, method: 'direct' };
  } catch (err) {
    console.error('Error in test logging:', err);
    return { success: false, error: err };
  }
};

// Export a window-accessible version for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testLogActivity = testLogActivity;
} 