#!/bin/bash

# Apply the migration to fix userlogsorg access
# Usage: ./scripts/apply_userlogsorg_fix.sh

# Check if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables"
  echo "Example: export SUPABASE_URL=https://your-project.supabase.co"
  echo "         export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
  exit 1
fi

echo "Applying userlogsorg access fix..."

# Run the migration using curl
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/pgmeta_ddl" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "sql": "$(cat supabase/migrations/00001_fix_userlogsorg_access.sql | tr -d '\n' | sed 's/"/\\"/g')"
}
EOF

echo -e "\nMigration completed! You can now test the activity logs functionality."
echo "For testing, you can import and use the testLogActivity function from utils/test-logging.ts"
echo "or run it directly from the browser console: window.testLogActivity()" 