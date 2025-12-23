#!/bin/bash
set -e

# Production PostgreSQL Docker Runner
# This script runs PostgreSQL as a standalone Docker container for production use

# Configuration - Override these via environment variables
POSTGRES_VERSION="${POSTGRES_VERSION:-16.4}"
POSTGRES_ADMIN_USER="${POSTGRES_ADMIN_USER:-postgres}"
POSTGRES_ADMIN_PASSWORD="${POSTGRES_ADMIN_PASSWORD:?Error: POSTGRES_ADMIN_PASSWORD must be set}"
POSTGRES_DATA_DIR="${POSTGRES_DATA_DIR:-/var/lib/postgresql-data}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
CONTAINER_NAME=postgres

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting PostgreSQL ${POSTGRES_VERSION} for production...${NC}"

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}Container ${CONTAINER_NAME} already exists. Removing it...${NC}"
    docker stop "${CONTAINER_NAME}" 2>/dev/null || true
    docker rm "${CONTAINER_NAME}" 2>/dev/null || true
fi

# Create data directory if it doesn't exist
mkdir -p "${POSTGRES_DATA_DIR}"

# Run PostgreSQL
docker run -d \
    --name "${CONTAINER_NAME}" \
    --network eng_net \
    --restart unless-stopped \
    -e POSTGRES_USER="${POSTGRES_ADMIN_USER}" \
    -e POSTGRES_PASSWORD="${POSTGRES_ADMIN_PASSWORD}" \
    -e POSTGRES_DB=postgres \
    -p "${POSTGRES_PORT}:5432" \
    -v "${POSTGRES_DATA_DIR}:/var/lib/postgresql/data" \
    -v "$(pwd)/docker/postgres/init:/docker-entrypoint-initdb.d" \
    postgres:${POSTGRES_VERSION}

echo -e "${GREEN}PostgreSQL container started successfully!${NC}"
echo ""
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: ${POSTGRES_PORT}"
echo "  Admin User: ${POSTGRES_ADMIN_USER}"
echo "  Database: postgres"
echo ""
echo "To view logs:"
echo "  docker logs -f ${CONTAINER_NAME}"
echo ""
echo "To connect with psql:"
echo "  docker exec -it ${CONTAINER_NAME} psql -U ${POSTGRES_ADMIN_USER}"
echo ""
echo "To stop:"
echo "  docker stop ${CONTAINER_NAME}"
