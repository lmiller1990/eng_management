# Production PostgreSQL Setup

This directory contains the production PostgreSQL Docker setup for the Engineering Management app.

## Directory Structure

```
docker/postgres/
├── run-postgres.sh                 # Script to run PostgreSQL container
├── setup-app-database.sh           # Admin script to create app database/user
├── init/
│   └── 01-create-app-database.sql  # Container initialization script (minimal)
└── README.md                       # This file
```

## Quick Start

### 1. Start PostgreSQL Container

Run PostgreSQL with an admin password:

```bash
POSTGRES_ADMIN_PASSWORD="your_secure_admin_password" \
POSTGRES_DATA_DIR="/path/to/persistent/storage" \
  ./docker/postgres/run-postgres.sh
```

This creates a bare PostgreSQL instance with only the default admin user.

### 2. Create Application Database and User (One-time Admin Task)

As a database administrator, run the setup script to create your application's database and user:

```bash
POSTGRES_ADMIN_PASSWORD="your_secure_admin_password" \
APP_DB_NAME="eng_management_production" \
APP_DB_USER="eng_app" \
APP_DB_PASSWORD="your_secure_app_password" \
  ./docker/postgres/setup-app-database.sh
```

This script:
- Creates the application database user
- Creates the application database
- Sets up proper permissions and ownership
- Is idempotent (safe to run multiple times)

### 3. Configure Your Application

Set your `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://eng_app:your_secure_app_password@localhost:5432/eng_management_production"
```

### 4. Run Rails Migrations

```bash
bundle exec rails db:migrate RAILS_ENV=production
```

### 5. Create Initial Data (Optional)

Use Rails console or seeds to create your initial admin user and data:

```bash
bundle exec rails console -e production
# Then create your admin user using your app's user creation logic
```

## Configuration Options

### run-postgres.sh

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_ADMIN_PASSWORD` | **Required** | Admin (postgres user) password |
| `POSTGRES_DATA_DIR` | `/var/lib/postgresql-data` | Where to persist data |
| `POSTGRES_VERSION` | `16.4` | PostgreSQL version |
| `POSTGRES_PORT` | `5432` | Port to expose |
| `POSTGRES_ADMIN_USER` | `postgres` | Admin username |
| `CONTAINER_NAME` | `eng-management-postgres` | Container name |

### setup-app-database.sh

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_ADMIN_PASSWORD` | **Required** | Admin password (same as run script) |
| `APP_DB_NAME` | **Required** | Application database name |
| `APP_DB_USER` | **Required** | Application database user |
| `APP_DB_PASSWORD` | **Required** | Application user password |
| `POSTGRES_ADMIN_USER` | `postgres` | Admin username |
| `CONTAINER_NAME` | `eng-management-postgres` | Container name |

## Common Operations

### View Logs

```bash
docker logs -f eng-management-postgres
```

### Connect with psql

```bash
docker exec -it eng-management-postgres psql -U postgres
```

### Stop Container

```bash
docker stop eng-management-postgres
```

### Restart Container

```bash
docker start eng-management-postgres
```

### Backup Database

```bash
docker exec eng-management-postgres pg_dump -U eng_app eng_management_production > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker exec -i eng-management-postgres psql -U eng_app eng_management_production
```

## Security Considerations

1. **Change all default passwords** - The init script uses a placeholder password
2. **Restrict network access** - In production, don't expose port 5432 publicly
3. **Use strong passwords** - Generate secure random passwords for all users
4. **Backup regularly** - Set up automated backups of your data directory
5. **Monitor disk space** - Ensure your data directory has adequate space

## Persistence

Data is persisted in the directory specified by `POSTGRES_DATA_DIR`. This directory contains:
- All database data
- Transaction logs
- Configuration files

**Important**: Back up this directory regularly!

## Troubleshooting

### Container won't start

Check logs:
```bash
docker logs eng-management-postgres
```

### Can't connect to database

1. Verify container is running: `docker ps`
2. Check port binding: `docker port eng-management-postgres`
3. Verify firewall settings
4. Check connection string format

### Permission errors

Ensure the data directory has proper ownership:
```bash
sudo chown -R 999:999 /path/to/postgresql-data
```

## Alternative: Managed Database Services

For production, consider using managed PostgreSQL services:
- AWS RDS
- Google Cloud SQL
- Azure Database for PostgreSQL
- Digital Ocean Managed Databases
- Heroku Postgres

These provide automatic backups, scaling, and maintenance.
