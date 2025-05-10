#!/bin/bash

# Script to run the SQL for creating the user_action_logs table
# Make sure you have the SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env variables set

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting creation of user_action_logs table...${NC}"

# Check if we have the necessary env variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}Error: Missing environment variables${NC}"
  echo "Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
  echo "You can find these in your Supabase dashboard under Project Settings > API"
  exit 1
fi

# Set the file path
SQL_FILE="./supabase/create_user_action_logs.sql"

# Check if the file exists
if [ ! -f "$SQL_FILE" ]; then
  echo -e "${RED}Error: SQL file not found at $SQL_FILE${NC}"
  exit 1
fi

# Read the SQL file
SQL=$(cat "$SQL_FILE")

# Execute the SQL using the Supabase REST API
echo "Executing SQL script..."
RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$SQL\"}")

# Check for errors in the response
if [[ "$RESPONSE" == *"error"* ]]; then
  echo -e "${RED}Error executing SQL:${NC}"
  echo "$RESPONSE"
  exit 1
else
  echo -e "${GREEN}Successfully created user_action_logs table!${NC}"
  echo "You can now use the logNewUserAction function to log user activities."
  exit 0
fi 