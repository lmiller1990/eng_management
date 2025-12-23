# Engineering Management Web App

A Ruby on Rails application with Tailwind CSS for engineering management.

## Tech Stack

* Ruby on Rails 8.1.1
* PostgreSQL 16 (Docker)
* Tailwind CSS
* Turbo & Stimulus (Hotwire)
* Rodauth (Authentication)
* Docker Compose (Postgres + Vault for secrets management)

## Setup

### 1. Start services with Docker Compose

```bash
docker compose up -d postgres vault
```

### 2. Install dependencies

```bash
bundle install
```

### 3. Create database

```bash
rails db:create
rails db:migrate
```

### 4. Start development server

```bash
./bin/dev
```

Visit http://localhost:3000

### Running the app container (production image)

Set `RAILS_MASTER_KEY` in your environment (or `.env`) and then:

```bash
docker compose up --build app
```

This runs the production image and maps container port 80 to host port 3000. For one-off tasks inside the image:

```bash
docker compose run --rm app ./bin/rails db:prepare
```

Environment variables are loaded from `.env` (see `.env.example` for defaults). Keep `RAILS_MASTER_KEY` secret and rotate the database password for real deployments.

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
# Connect with psql via Compose
docker compose exec postgres psql -U eng_app -d eng_app_db
```

## Domain Model

Platform for Engineering Managers to manage meetings with their team members, including note-taking and action item tracking.

### Core Entities

**Account**
- Authentication and user management via Rodauth
- Email stored as citext (case-insensitive) with email validation constraint
- Status enum: unverified (1), verified (2), closed (3)
- **Name Derivation**: Can derive first_name, last_name, and initials from email on-demand
  - Use `account.derive_name` to get a DerivedName struct with computed values
  - Supports custom derivation functions via optional parameter
  - Default strategy splits on dots/underscores (e.g., "john.doe@example.com" → "John Doe", initials "JD")
  - See `app/models/account.rb:57` for usage examples
- Automatically accepts pending team and memo invitations after creation (when password is set)
- Location: `app/models/account.rb`, tests: `test/models/account_test.rb`

**Meeting**
- Represents a meeting session
- Many-to-many relationship with Accounts via MeetingParticipants
- Has many Notes and ActionItems

**MeetingParticipant**
- Join table between Meetings and Accounts
- Tracks who participated in each meeting
- Meeting creator is automatically added as a participant
- Unique constraint prevents duplicate participants

**Note**
- Meeting notes with rich text content (JSON format for tiptap editor)
- Belongs to a Meeting and an Account (author)

**ActionItem**
- Tasks created during meetings
- Belongs to a Meeting and an Account (assignee)
- Has a title field

### Workflow

1. User signs up via `/create-account`
2. User creates a meeting (automatically becomes a participant)
3. User adds other participants to the meeting
4. Within a meeting, users can:
   - Create and edit notes
   - Create and assign action items
   - Add/remove participants

### Available Routes

**Meetings:**
* `/meetings` - List all meetings
* `/meetings/:id` - View meeting details (shows all participants, notes, and action items)

**Nested Resources (accessed through meetings):**
* `/meetings/:meeting_id/participants` - Add/remove meeting participants (inline on meeting show page)
* `/meetings/:meeting_id/notes` - Create/edit meeting notes
* `/meetings/:meeting_id/action_items` - Create/edit action items

All notes, action items, and participants are managed within their parent meeting context.

## Vault (local usage)

Vault runs in Docker Compose alongside Postgres. It is reachable at `http://127.0.0.1:8200` from the host and the Docker network only (keep the host firewalled; do not expose this publicly).

1) Ensure Vault is running: `docker compose up -d vault`
2) Point the CLI: `export VAULT_ADDR=http://127.0.0.1:8200`
3) First-time init + unseal (store the unseal key and root token somewhere safe):

Rails Secret: `vault kv put secret/notae/rails master_key=$(openssl rand -hex 16)`

```bash
docker compose exec vault vault operator init -key-shares=1 -key-threshold=1
docker compose exec vault vault operator unseal <unseal-key>
export VAULT_TOKEN=<root-token>
docker compose exec -e VAULT_TOKEN vault vault status
```

Next steps: enable the database secrets engine, configure the Postgres connection, and create a role that mints short-lived app users. Keep `DATABASE_URL` env-driven so Rails can source credentials from Vault at boot. For production/staging, use auto-unseal (e.g., cloud KMS) and keep Vault internal-only.
