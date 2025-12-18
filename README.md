# Engineering Management Web App

A Ruby on Rails application with Tailwind CSS for engineering management.

## Tech Stack

* Ruby on Rails 8.1.1
* PostgreSQL 17 (Docker)
* Tailwind CSS
* Turbo & Stimulus (Hotwire)
* Rodauth (Authentication)

## Setup

### 1. Start PostgreSQL in Docker

```bash
docker run --name eng-management-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:17
```

### 2. Install Dependencies

```bash
bundle install
```

### 3. Create Database

```bash
rails db:create
rails db:migrate
```

### 4. Start Development Server

```bash
./bin/dev
```

Visit http://localhost:3000

## Authentication

The app uses [Rodauth](https://github.com/janko/rodauth-rails) for email/password authentication with the following features:

* Email/password login and registration
* Password reset via email
* Remember me (persistent sessions)
* All pages require authentication by default

**Available routes:**
* `/login` - Sign in
* `/create-account` - Sign up
* `/reset-password-request` - Reset password
* `/logout` - Sign out

**Development notes:**
* Password reset emails are logged to console in development mode
* First user: visit `/create-account` to register

## Database Management

```bash
# Start PostgreSQL
docker start eng-management-postgres

# Stop PostgreSQL
docker stop eng-management-postgres

# Connect with psql
docker exec -it eng-management-postgres psql -U postgres -d eng_management_development
```

## Next Steps

- [x] Create application controller and home page
- [x] Add authentication
- [ ] Build core features
- [ ] Deploy to production
