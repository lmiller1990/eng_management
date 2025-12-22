#!/usr/bin/env bash
set -euo pipefail

# Idempotently align Postgres user/db with credentials stored in Vault.

VAULT_DB_SECRET_PATH=${VAULT_DB_SECRET_PATH:-secret/notae/database}
TARGET_DB=${POSTGRES_DB:-eng_app_db}
DB_ADMIN_USER=${DB_ADMIN_USER:-postgres}

if [[ -z "${DB_ADMIN_PASSWORD:-}" ]]; then
  echo "Set DB_ADMIN_PASSWORD for the admin role (${DB_ADMIN_USER}) before running." >&2
  exit 1
fi

DB_USER=$(vault kv get -field=username "${VAULT_DB_SECRET_PATH}")
DB_PASSWORD=$(vault kv get -field=password "${VAULT_DB_SECRET_PATH}")

# Basic escaping to avoid SQL injection/malformed statements.
DB_USER_IDENT=${DB_USER//\"/\"\"}
DB_NAME_IDENT=${TARGET_DB//\"/\"\"}
DB_PASSWORD_LIT=${DB_PASSWORD//\'/\'\'}

PGPASSWORD="${DB_ADMIN_PASSWORD}" docker compose exec -T postgres psql -U "${DB_ADMIN_USER}" -d postgres <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER_IDENT}') THEN
    CREATE ROLE "${DB_USER_IDENT}" LOGIN PASSWORD '${DB_PASSWORD_LIT}';
  ELSE
    ALTER ROLE "${DB_USER_IDENT}" WITH LOGIN PASSWORD '${DB_PASSWORD_LIT}';
  END IF;
END
\$\$;

DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME_IDENT}') THEN
    CREATE DATABASE "${DB_NAME_IDENT}" OWNER "${DB_USER_IDENT}" TEMPLATE template0;
  END IF;
END
\$\$;

GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME_IDENT}" TO "${DB_USER_IDENT}";
SQL

echo "Synced Postgres role/db to Vault secret at ${VAULT_DB_SECRET_PATH} (user: ${DB_USER}, db: ${TARGET_DB})."
