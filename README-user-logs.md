# User Action Logs Implementation

This document explains the approach for creating a parallel user-focused logging system instead of migrating the existing agent-based action logs.

## Overview

Instead of modifying the existing `action_logs` table to support users, we've created a new `user_action_logs` table specifically designed for the user system. This allows us to:

1. Keep the existing agent logs intact without disruption
2. Design a clean schema for user logs without compromises
3. Gradually transition from agent to user logging
4. Query both log sources during the transition period

## Implementation Details

### Database

The new `user_action_logs` table has the following structure:

```sql
CREATE TABLE user_action_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acting_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

Key differences from the `action_logs` table:
- No `acting_agent_id` column - only focused on users
- Clean foreign key references without legacy compatibility issues
- Row-Level Security (RLS) policies from the start

### Utility Functions

We've added a new `logNewUserAction` function in `src/utils/logging.ts` that logs to the new table:

```typescript
export const logNewUserAction = async (
  actionType: string,
  userId: string,
  actingUserId?: string | null,
  targetTable?: string | null,
  targetId?: string | null,
  details?: Record<string, any> | null
) => {
  try {
    const { data, error } = await supabase
      .from('user_action_logs')
      .insert({
        user_id: userId,
        acting_user_id: actingUserId || null,
        action_type: actionType,
        target_table: targetTable || null,
        target_id: targetId || null,
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
```

The existing `logUserAction` function is preserved for backward compatibility.

### UI Components

The Activity page has been updated to:
- Fetch logs from both tables
- Allow filtering by log source (agent_logs or user_logs)
- Display a visual indicator showing which source each log comes from
- Sort and display logs from both sources in a unified timeline

## Migration Path

1. **Short-term (Now)**: 
   - Run the create_user_action_logs.sql script to create the new table
   - Use both logging functions during transition
   - View combined logs in the Activity page

2. **Medium-term (Coming Weeks)**:
   - Gradually replace `logUserAction` calls with `logNewUserAction` in new code
   - Monitor log sources to ensure both are working correctly

3. **Long-term (Future)**:
   - Once the transition to users is complete, consider:
     - Archiving old agent logs to a separate table
     - Making `logNewUserAction` the default
     - Potentially removing the agent logs display from the UI

## Running the Migration

To create the new table:

```bash
# Set your Supabase environment variables
export SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the migration script
./scripts/run_create_user_action_logs.sh
```

## Future Considerations

- We may want to add additional indices for performance once we understand common query patterns
- Consider adding more sophisticated RLS policies based on user roles
- Implement log rotation or archiving for older logs to maintain performance 