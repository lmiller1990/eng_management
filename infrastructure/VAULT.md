# HashiCorp Vault Production Setup Guide

This guide walks through setting up a production Vault instance using Docker with persistent storage.

## Prerequisites

- Docker installed
- vault CLI installed on your host machine

## Step 1: Create Directory Structure

```bash
# Create directories for Vault (requires sudo)
sudo mkdir -p /var/lib/vault/{config,data,logs}
```

## Step 2: Create Vault Configuration

Create the configuration file:

```bash
sudo tee /var/lib/vault/config/vault.hcl > /dev/null <<'EOF'
storage "file" {
  path = "/vault/file"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

api_addr = "http://0.0.0.0:8200"
ui = true
EOF
```

**Note:** `tls_disable = 1` is for development/testing. For production, you should enable TLS.

## Step 3: Start Vault Container

```bash
docker run -d \
  --name vault-production \
  --restart unless-stopped \
  --cap-add=IPC_LOCK \
  -p 8200:8200 \
  -v /var/lib/vault/data:/vault/file:rw \
  -v /var/lib/vault/config:/vault/config:ro \
  -v /var/lib/vault/logs:/vault/logs:rw \
  -e VAULT_ADDR='http://0.0.0.0:8200' \
  hashicorp/vault:latest server
```

Check that it's running:

```bash
docker logs vault-production
```

## Step 4: Initialize Vault

Set up your environment:

```bash
export VAULT_ADDR='http://127.0.0.1:8200'
```

Initialize Vault (first time only):

```bash
vault operator init
```

**CRITICAL:** Save the output! You'll get:
- 5 Unseal Keys
- 1 Initial Root Token

Example output:
```
Unseal Key 1: <key1>
Unseal Key 2: <key2>
Unseal Key 3: <key3>
Unseal Key 4: <key4>
Unseal Key 5: <key5>

Initial Root Token: hvs.xxxxx
```

**Store these securely!** You need 3 of the 5 unseal keys to unseal Vault.

## Step 5: Unseal Vault

Vault starts sealed. You must unseal it with 3 of the 5 keys:

```bash
vault operator unseal <unseal-key-1>
vault operator unseal <unseal-key-2>
vault operator unseal <unseal-key-3>
```

Check status:

```bash
vault status
```

You should see `Sealed: false`.

## Step 6: Authenticate

```bash
export VAULT_TOKEN='<your-initial-root-token>'
vault login
```

## Step 7: Enable KV Secrets Engine

```bash
# Enable KV v2 secrets engine
vault secrets enable -path=secret kv-v2
```

## Step 8: Create Your First Secret

```bash
vault kv put secret/notae/database \
  username=dbuser \
  password=$(openssl rand -base64 32)
```

## Step 9: Create an Application Policy

Create a policy for your application:

```bash
vault policy write notae-policy - <<EOF
# Read secrets
path "secret/data/notae/*" {
  capabilities = ["read", "list"]
}
EOF
```

## Step 10: Set Up AppRole Authentication

AppRole is recommended for applications:

```bash
# Enable AppRole auth
vault auth enable approle

# Create a role
vault write auth/approle/role/notae \
  token_policies="notae-policy" \
  token_ttl=1h \
  token_max_ttl=4h

# Get role ID (static)
vault read auth/approle/role/notae/role-id

# Generate secret ID (treat like a password)
vault write -f auth/approle/role/notae/secret-id
```

Save the `role_id` and `secret_id` - your application will use these to authenticate.

## Step 11: Application Authentication

Your app can authenticate like this:

```bash
# Login with AppRole
VAULT_TOKEN=$(vault write -field=token auth/approle/login \
  role_id="<role-id>" \
  secret_id="<secret-id>")

export VAULT_TOKEN

# Now read secrets
vault kv get secret/notae/database
```

## Useful Commands

### Check Vault Status
```bash
vault status
```

### List Secrets
```bash
vault kv list secret/notae
```

### Read a Secret
```bash
vault kv get secret/notae/database
vault kv get -field=password secret/notae/database
```

### Update a Secret
```bash
vault kv put secret/notae/database \
  username=dbuser \
  password=newpassword
```

### Seal Vault (Emergency)
```bash
vault operator seal
```

### Restart Container
```bash
docker restart vault-production
# Remember: Vault starts sealed after restart - you must unseal it again!
```

## Container Management

### View logs
```bash
docker logs -f vault-production
```

### Stop Vault
```bash
docker stop vault-production
```

### Start Vault
```bash
docker start vault-production
# Don't forget to unseal after starting!
```

### Remove container (keeps data)
```bash
docker rm -f vault-production
```

## Backup Strategy

Your data is in `/var/lib/vault/data`. Back this up regularly:

```bash
# Create backup
sudo tar -czf vault-backup-$(date +%Y%m%d).tar.gz /var/lib/vault/data

# Restore backup
sudo tar -xzf vault-backup-YYYYMMDD.tar.gz -C /
```

## Important Notes

1. **Unsealing After Restart:** Vault seals itself when the container restarts. You must unseal it manually.

2. **Root Token:** The initial root token has unlimited access. Create limited tokens for daily use.

3. **Unseal Keys:** Store the 5 unseal keys in different secure locations. Never store them together.

4. **Auto-Unseal:** For production, consider cloud auto-unseal (AWS KMS, Azure Key Vault, etc.) to avoid manual unsealing.

5. **TLS:** Enable TLS in production by updating the listener configuration and providing certificates.

6. **Monitoring:** Set up monitoring for Vault's health endpoint: `http://localhost:8200/v1/sys/health`

## Production TLS Configuration (Optional)

To enable TLS, update `/var/lib/vault/config/vault.hcl`:

```hcl
listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_disable   = 0
  tls_cert_file = "/vault/config/tls/vault.crt"
  tls_key_file  = "/vault/config/tls/vault.key"
}
```

Create TLS directory and add your certificates:

```bash
sudo mkdir -p /var/lib/vault/config/tls
# Copy your certificates there
```

And mount them in the docker run command:

```bash
-v /var/lib/vault/config/tls:/vault/config/tls:ro
```

## Troubleshooting

### Vault won't start
```bash
docker logs vault-production
```

### Forgot to unseal after restart
```bash
vault operator unseal <key1>
vault operator unseal <key2>
vault operator unseal <key3>
```

### Lost root token
If you have unseal keys, you can generate a new root token:
```bash
vault operator generate-root
```

### Permission issues
Ensure Docker has access to `/var/lib/vault`:
```bash
sudo chown -R $(id -u):$(id -g) /var/lib/vault
```

## Next Steps

- Set up automated backups
- Configure audit logging
- Implement secret rotation
- Set up monitoring and alerts
- Consider HA setup with Consul backend for production
