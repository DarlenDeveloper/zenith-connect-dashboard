# User Action Logging System

This document explains how to use the user action logging system to record user activities in your application.

## Overview

The user action logging system records user actions in the `userlogsorg` table in Supabase. This allows you to track user activities and display them in the Activity page.

## How to Log User Actions

To log user actions in your application, use the `logUserAction` function from `src/utils/simple-logger.ts`:

```typescript
import { logUserAction, LogActions } from '@/utils/simple-logger';

// Example: Log a page view
logUserAction(LogActions.VIEW_PAGE, {
  page: 'ProductPage',
  timestamp: new Date().toISOString()
});

// Example: Log a custom action with details
logUserAction('COMPLETE_PURCHASE', {
  orderId: '12345',
  amount: 99.99,
  products: ['item1', 'item2'],
  timestamp: new Date().toISOString()
});
```

## Common Action Types

Use the `LogActions` object to access predefined action types:

```typescript
LogActions.VIEW_PAGE     // When user views a page
LogActions.CREATE_ITEM   // When user creates an item
LogActions.UPDATE_ITEM   // When user updates an item
LogActions.DELETE_ITEM   // When user deletes an item
LogActions.LOGIN         // When user logs in
LogActions.LOGOUT        // When user logs out
LogActions.SEARCH        // When user performs a search
LogActions.DOWNLOAD      // When user downloads something
LogActions.UPLOAD        // When user uploads something
```

You can also use custom action types by passing a string as the first parameter.

## User ID Handling

The logging utility automatically:

1. Gets the current authenticated user's ID
2. Includes the user ID in the details object for better visibility
3. Records the timestamp of the action

## Testing the Logging System

Use the logging demo page to test the logging functionality:

1. Navigate to `/logging-demo` in your application
2. Click on the various buttons to log different types of actions
3. Check the Activity page to see the logged actions

## Viewing Logs

The Activity page (`/activity`) displays all logged user actions:

- Shows the full user ID with a copy-to-clipboard button
- Displays action type with appropriate color coding
- Shows detailed information in a collapsible JSON format
- Allows filtering by action type and searching logs

## Database Schema

The `userlogsorg` table has the following structure:

```sql
CREATE TABLE userlogsorg (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

## Permissions and RLS Policies

The table has Row Level Security (RLS) policies that:

1. Allow users to insert their own logs
2. Allow users to view their own logs
3. Allow service roles to access all logs (for admin and reporting purposes)

There's also a service function (`insert_user_log`) that bypasses RLS for more reliable logging.

## Best Practices

1. Always include meaningful details with each logged action
2. Use consistent action type naming (uppercase with underscores)
3. Include timestamps in the details for better tracking
4. Include contextual information like page names, item IDs, etc.
5. Don't log sensitive information like passwords or personal data 