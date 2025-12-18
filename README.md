# Engineering Management Web App

A Ruby on Rails application with Tailwind CSS for engineering management.

## Prerequisites

* Ruby 3.x
* Node.js 14+
* Docker (for PostgreSQL)

## Database Setup

This application uses PostgreSQL running in a Docker container.

### Start PostgreSQL in Docker

```bash
docker run --name eng-management-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:17
```

This command:
- Creates a container named `eng-management-postgres`
- Sets the default username and password to `postgres`
- Exposes PostgreSQL on port 5432 (the standard PostgreSQL port)
- Runs in detached mode (`-d`)
- Uses PostgreSQL version 17

### Manage the PostgreSQL Container

```bash
# Stop the container
docker stop eng-management-postgres

# Start the container
docker start eng-management-postgres

# Remove the container (warning: deletes all data)
docker rm eng-management-postgres
```

## Getting Started

1. **Install dependencies**
   ```bash
   bundle install
   ```

2. **Start PostgreSQL** (if not already running)
   ```bash
   docker start eng-management-postgres
   ```

3. **Create and setup the database**
   ```bash
   rails db:create
   rails db:migrate
   ```

4. **Start the development server**
   ```bash
   ./bin/dev
   ```

   This starts both the Rails server and Tailwind CSS build process.

5. **Visit the application**

   Open http://localhost:3000 in your browser

## Running Tests

```bash
# Run all tests
rails test

# Run system tests
rails test:system
```

## Deployment

Deployment instructions will be added here.
