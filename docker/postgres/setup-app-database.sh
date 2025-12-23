#!/bin/bash
set -e

# Application Database Setup Script
# Run this once as a DB admin to create the application database and user

# Required environment variables
POSTGRES_ADMIN_USER="${POSTGRES_ADMIN_USER:-postgres}"
POSTGRES_ADMIN_PASSWORD="${POSTGRES_ADMIN_PASSWORD:?Error: POSTGRES_ADMIN_PASSWORD must be set}"
CONTAINER_NAME="${CONTAINER_NAME:-eng-management-postgres}"

# Application database configuration
APP_DB_NAME="${APP_DB_NAME:?Error: APP_DB_NAME must be set (e.g., eng_management_production)}"
APP_DB_USER="${APP_DB_USER:?Error: APP_DB_USER must be set (e.g., eng_app)}"
APP_DB_PASSWORD="${APP_DB_PASSWORD:?Error: APP_DB_PASSWORD must be set}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up application database...${NC}"
echo "Database: ${APP_DB_NAME}"
echo "User: ${APP_DB_USER}"
echo ""

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}Error: Container ${CONTAINER_NAME} is not running${NC}"
    echo "Start it first using run-postgres.sh"
    exit 1
fi

# Create the application user and database
docker exec -i "${CONTAINER_NAME}" psql -U "${POSTGRES_ADMIN_USER}" <<EOF
-- Create application user if it doesn't exist
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '${APP_DB_USER}') THEN
        CREATE USER ${APP_DB_USER} WITH PASSWORD '${APP_DB_PASSWORD}';
        RAISE NOTICE 'User ${APP_DB_USER} created';
    ELSE
        RAISE NOTICE 'User ${APP_DB_USER} already exists';
        -- Update password in case it changed
        ALTER USER ${APP_DB_USER} WITH PASSWORD '${APP_DB_PASSWORD}';
        RAISE NOTICE 'Password updated for ${APP_DB_USER}';
    END IF;
END
\$\$;

-- Create application database if it doesn't exist
SELECT 'CREATE DATABASE ${APP_DB_NAME} OWNER ${APP_DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${APP_DB_NAME}')
\gexec

-- Grant necessary privileges
GRANT ALL PRIVILEGES ON DATABASE ${APP_DB_NAME} TO ${APP_DB_USER};

-- Connect to the application database to set up schema privileges
\c ${APP_DB_NAME}

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO ${APP_DB_USER};
GRANT CREATE ON SCHEMA public TO ${APP_DB_USER};

-- Grant default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${APP_DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${APP_DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO ${APP_DB_USER};

\echo ''
\echo 'Application database setup complete!'
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Success!${NC}"
    echo ""
    echo "Database URL for your application:"
    echo -e "${YELLOW}postgresql://${APP_DB_USER}:${APP_DB_PASSWORD}@localhost:5432/${APP_DB_NAME}${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Set DATABASE_URL in your application environment"
    echo "  2. Run migrations: bundle exec rails db:migrate RAILS_ENV=production"
    echo "  3. Seed data if needed: bundle exec rails db:seed RAILS_ENV=production"
else
    echo -e "${RED}Failed to set up database${NC}"
    exit 1
fi
