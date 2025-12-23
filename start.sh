#!/usr/bin/env sh
set -e

export VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"

POSTGRES_USER="$(vault kv get -field=username secret/notae/database)"
POSTGRES_PASSWORD="$(vault kv get -field=password secret/notae/database)"
POSTGRES_DB=notae
export DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"
export SECRET_KEY_BASE="$(vault kv get -field=secret_key_base secret/notae/rails)"

