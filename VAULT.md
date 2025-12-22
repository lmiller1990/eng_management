# Vault Day-0 Plan

## Goals
- Run Vault alongside Postgres via Docker Compose (internal-only, not public-facing).
- Store Rails and Postgres secrets in Vault; app receives them via env at start.
- Use least-privilege tokens instead of the root token for daily use.

## Services
- Compose services: `postgres`, `vault`, `app`.
- Vault listens on `http://127.0.0.1:8200` (and the Docker network). Keep the host firewalled; add TLS when ready.

## Day-0 Steps (local/dev)
1) Start services: `docker compose up -d postgres vault`
2) Init + unseal Vault (one time):
   - `docker compose exec vault vault operator init -key-shares=1 -key-threshold=1`
   - `docker compose exec vault vault operator unseal <unseal-key>`
   - Capture unseal key + root token; store securely (not in git).
3) Set CLI env for convenience: `export VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=<root-token>`
4) Enable engines:
   - KV for general secrets: `vault secrets enable -path=kv kv-v2`
   - (Optional/preferred) Database engine for dynamic Postgres creds: `vault secrets enable database`
5) Seed secrets:
   - KV static: `vault kv put kv/postgres app_user=eng_app app_password=change_me db_name=eng_app_db host=postgres`
   - Rails master key: `vault kv put kv/rails master_key=<value>`
6) Create policies:
   - `app-policy` (read-only for app secrets): allow `read` on `kv/data/postgres`, `kv/data/rails` or on `database/creds/app-role` if using dynamic creds.
   - `admin-policy` (for you): manage `kv/*`, `database/*`, and `sys/mounts` as needed.
7) Create auth method for the app (local-friendly):
   - AppRole: bind `app-policy` to an AppRole; capture `role_id` and a wrapped `secret_id` for deployment.
   - Future: Kubernetes auth or cloud IAM auth in staging/prod.
8) Create auth for admin:
   - AppRole or token tied to `admin-policy` (do not reuse root for day-to-day).

## App Integration (Compose)
- Keep `DATABASE_URL` and `RAILS_MASTER_KEY` unset in image layers; fetch from Vault at container start.
- Entrypoint approach (outline):
  1) Use `VAULT_ADDR` + a wrapped AppRole `secret_id` to log in and get a short-lived Vault token.
  2) Read secrets:
     - Static KV: `vault kv get -format=json kv/postgres` → build `DATABASE_URL`
     - Dynamic DB: `vault read -format=json database/creds/app-role` → build `DATABASE_URL` (renew or refetch before TTL expires)
     - Rails: `vault kv get -format=json kv/rails` → `RAILS_MASTER_KEY`
  3) `export DATABASE_URL` and `RAILS_MASTER_KEY`, then `exec ./bin/thrust ./bin/rails server`
- For one-off tasks: `docker compose run --rm app <cmd>` (entrypoint should fetch secrets the same way).

## Admin Access
- CLI/UI: `export VAULT_ADDR=http://127.0.0.1:8200` and `VAULT_TOKEN=<admin-token>` (from admin policy/AppRole). Avoid using root except for bootstrap.
- To fetch DB creds manually:
  - KV: `vault kv get kv/postgres`
  - Dynamic: `vault read database/creds/app-role` (use returned `username/password` before TTL expires).

## Hardening / Next Steps
- Add TLS to Vault listener; set `VAULT_CACERT` for clients.
- Use auto-unseal (cloud KMS/HSM) outside dev; limit who has unseal keys.
- Rotate the initial Postgres admin password after Vault is configured.
- Reduce TTLs for dynamic creds (e.g., 1h) and add monitoring for lease renewals.
- Keep Vault internal-only; expose via load balancer/internal network only when needed.
