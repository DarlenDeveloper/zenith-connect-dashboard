# Call Duration Calculations

This feature adds functionality to calculate average call duration from the existing calls table.

## Database Setup

Run the script to create the function for calculating average call duration:
```bash
supabase sql < supabase/use_existing_calls_table.sql
```

## How It Works

The system uses the `duration` field in the existing `calls` table to calculate statistics. The average duration is calculated using a Supabase stored function that converts the interval data to minutes.

The function `get_average_call_duration(p_user_id UUID)` calculates the average duration in minutes for calls belonging to a specific user. This is displayed in the "Avg. Duration" card on the Call History page.

## Troubleshooting

If you encounter issues:

1. Check that the SQL script has been run successfully
2. Verify the database connection in the Supabase client
3. Check the browser console for any errors
4. Ensure that the `duration` field in the calls table contains valid interval data 