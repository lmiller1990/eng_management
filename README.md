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

## DB

```
docker exec -it eng-management-postgres psql -U postgres

# erd
bundle exec erd
```


