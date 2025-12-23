-- Production PostgreSQL Initialization Script
-- This script runs once when the PostgreSQL container is first initialized
-- It only performs basic PostgreSQL setup, not application-specific configuration

-- Log initialization
\echo 'PostgreSQL container initialized successfully!'
\echo 'Next steps:'
\echo '  1. Run the setup-app-database.sh script to create your application database and user'
\echo '  2. Configure your application with the DATABASE_URL'
\echo '  3. Run your application migrations'
