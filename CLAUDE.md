# CLAUDE.md - Engineering Management Codebase Guide

This document provides essential context for LLMs implementing features in this codebase.

## Project Overview

**Engineering Management** is a web application for engineering managers to manage teams, meetings, notes, and action items with real-time collaborative editing. The app features CRDT-based document synchronization for multi-user editing.

**Key Characteristics:**
- Modern Rails 8 + Hotwire stack
- Real-time collaboration via WebSocket (Y.js + Action Cable)
- Role-based authorization (Pundit)
- Email-based invitation workflow
- Production-ready with Docker & Kamal deployment

---

## Technology Stack

### Backend
- **Language:** Ruby 3.4.8
- **Framework:** Rails 8.1.1
- **Database:** PostgreSQL 17 (4 databases: primary, cache, queue, cable)
- **Authentication:** Rodauth-Rails 2.1 (email/password with password reset)
- **Authorization:** Pundit 2.5 (policy-based access control)
- **Real-time Collaboration:** Y.js + y-rb-actioncable 0.1.7 (CRDT-based sync)
- **Job Queue:** Solid Queue (database-backed)
- **Caching:** Solid Cache (database-backed)
- **WebSocket:** Solid Cable (database-backed Action Cable adapter)
- **Email:** AWS SES via aws-actionmailer-ses
- **Web Server:** Puma
- **Deployment:** Kamal (Docker-based)

### Frontend
- **Language:** TypeScript 5.9.3
- **Build Tool:** ESBuild 0.27.2 (ES Modules)
- **CSS Framework:** Tailwind CSS 4.x
- **JavaScript Framework:** Hotwire (Turbo 8.0.20 + Stimulus 3.2.2)
- **Rich Text Editor:** TipTap 3.14.0 with Markdown & real-time collab support
- **CRDT State:** Y.js 13.6.28

### Development & Testing
- **Package Manager:** pnpm 10.26.0 (locked)
- **Testing:** Minitest 5.0 (unit/integration) + Playwright 1.57.0 (E2E)
- **Code Quality:** Rubocop-rails-omakase, Brakeman (security), Bundler-audit
- **Formatting:** Prettier (JS), erb-formatter (ERB), Rubocop (Ruby)
- **Containerization:** Docker + Docker Compose

---

## Database Schema (Key Tables)

```
accounts
  ├── email (citext, unique)
  ├── password_hash
  ├── status (enum: unverified|verified|closed)
  ├── roles (array)
  └── admin (boolean)

teams
  ├── name
  ├── description
  └── owner_id (fk: accounts)

team_memberships (unique: team_id + account_id)
  ├── team_id (fk)
  ├── account_id (fk)
  └── role (enum: member|admin|owner)

memos
  ├── account_id (fk: creator/owner)
  ├── title
  ├── content
  ├── memo_type (enum: shared|team_one_on_one)
  └── yjs_state (binary CRDT state)

memo_editors (unique: memo_id + account_id)
  ├── memo_id (fk)
  └── account_id (fk)

memo_invitations (7-day expiration)
  ├── memo_id (fk)
  ├── email
  ├── token
  └── accepted_at

teams_invitations (7-day expiration)
  ├── team_id (fk)
  ├── email
  ├── token
  └── accepted_at

meetings
  ├── title
  └── created_at

meeting_participants (unique: meeting_id + account_id)
  ├── meeting_id (fk)
  └── account_id (fk)

notes
  ├── meeting_id (fk)
  ├── account_id (fk: creator)
  └── content

action_items
  ├── meeting_id (fk)
  ├── account_id (fk: assignee)
  └── title
```

**PostgreSQL Extensions:** citext (case-insensitive email), plpgsql (stored procedures)

---

## Core Features

### 1. Authentication & Authorization
- Email/password login via Rodauth-Rails
- Password reset with token expiration
- Remember-me persistent sessions
- Pundit-based authorization with policies
- Account status tracking (unverified/verified/closed)

### 2. Real-time Collaborative Editing
- Memo creation and editing with TipTap rich text editor
- Markdown support
- Multi-user simultaneous editing (CRDT-based via Y.js)
- WebSocket synchronization via Action Cable (SyncChannel)
- Auto-save with sync notifications (1000ms debounce)
- Yjs state persisted in `memos.yjs_state` column

### 3. Teams & Membership
- Create teams with role-based membership (owner/admin/member)
- Team invitations with email signup flow
- Auto-generated one-on-one memos for each team member
- Prevent removal of last team owner
- Team member management

### 4. Meetings & Notes
- Create meetings with participants
- Add/remove participants
- Create and edit meeting notes with rich text
- Create and assign action items
- Track meeting participation

### 5. Invitation Workflow
- Token-based invitations (7-day expiration)
- Email verification links
- Placeholder account creation for uninvited users
- Password setup flow during invitation acceptance
- Auto-acceptance of pending invitations when password is set

### 6. Notifications
- Email invitations for teams and memos
- Password reset emails
- Toast notifications for auto-save status

---

## API Routes & Entry Points

### Authentication
```
GET  /login
POST /create-account
GET  /reset-password-request
POST /logout
```

### Memos (Real-time Collaborative Documents)
```
GET    /memos                     → list user's memos
GET    /memos/:id                 → view memo
GET    /memos/:id/edit            → edit with TipTap editor
POST   /memos                     → create
PATCH  /memos/:id                 → update (full save)
DELETE /memos/:id                 → delete

POST   /memos/:id/invitations     → invite editor
DELETE /memos/:id/invitations/:id → cancel invitation

GET    /memo-invitations/:token/accept
POST   /memo-invitations/:token/complete-setup
```

### Meetings
```
GET    /meetings
GET    /meetings/:id              → show with participants, notes, action items
POST   /meetings
PATCH  /meetings/:id
DELETE /meetings/:id

POST   /meetings/:id/participants
DELETE /meetings/:id/participants/:id

POST   /meetings/:id/notes
PATCH  /meetings/:id/notes/:id
DELETE /meetings/:id/notes/:id

POST   /meetings/:id/action_items
PATCH  /meetings/:id/action_items/:id
DELETE /meetings/:id/action_items/:id
```

### Teams
```
GET    /teams                     → list user's teams
GET    /teams/:id
POST   /teams
PATCH  /teams/:id
DELETE /teams/:id

POST   /teams/:id/invitations
DELETE /teams/:id/invitations/:id

GET    /invitations/:token/accept
POST   /invitations/:token/complete-setup

DELETE /teams/:id/memberships/:id
```

### WebSocket
```
Action Cable Channel: SyncChannel
  Subscribe to:   memos:MEMO_ID
  Receive:        Y.js update messages
  Broadcast:      Real-time document updates to all connected editors
```

---

## Important Patterns & Conventions

### Authentication
```ruby
# Access current user
current_account  # via Rodauth.rails_account

# Require authentication
authenticate  # before_action filter (via rodauth.require_authentication)

# Check if authenticated
rodauth.authenticated?
```

### Authorization (Pundit)
```ruby
# In controllers
authorize @memo
policy_scope(Memo)

# In policies (/app/policies/)
ApplicationPolicy, MemoPolicy, TeamMemberPolicy

# Helper methods
current_account  # Pundit user is current_account
```

### Real-time Collaboration
```ruby
# Models
# Memos have: yjs_state (binary CRDT state)
# All updates broadcast through SyncChannel

# WebSocket Channel: SyncChannel
# Stores Y.js awareness state for all connected clients
# Broadcasts updates from Y.js to all subscribers
```

### Invitation Pattern
```ruby
# Token generation
SecureRandom.urlsafe_base64

# Expiration: 7 days from creation
# Callback: auto-accept pending invitations when account password set
# Placeholder accounts created for uninvited users
# Password setup required to complete account creation
```

### Database Constraints
```
Unique constraints:
  - accounts.email (citext)
  - team_memberships (team_id, account_id)
  - memo_editors (memo_id, account_id)
  - meeting_participants (meeting_id, account_id)

Foreign keys with cascading deletes for cleanup
```

### View Organization
```
/app/views/[controller_name]/
  ├── index.html.erb
  ├── show.html.erb
  ├── edit.html.erb
  ├── new.html.erb
  └── [custom_views].html.erb
```

### Stimulus Controllers
```
Location: /app/javascript/controllers/[name]_controller.ts
Pattern:
  - One file per controller
  - TypeScript with proper types
  - Outlet pattern for parent-child communication
  - Target definitions for DOM elements
```

### Models
```
Location: /app/models/[name].rb
Pattern:
  - Relationships with proper associations
  - Validations with scoped uniqueness
  - Scopes for common queries
  - Callbacks for auto-acceptance, setup, etc.
```

### Policies (Authorization)
```
Location: /app/policies/[model]_policy.rb
Methods:
  - index?, show?, create?, update?, destroy?
  - Each returns true/false for access decision
```

---

## Configuration Files

### Essential Environment Variables
```
RAILS_MASTER_KEY            # Encryption key for config/credentials.yml.enc
DB_HOST                     # PostgreSQL host
DB_USER                     # PostgreSQL user (default: postgres)
DB_PASSWORD                 # PostgreSQL password
DB_PORT                     # PostgreSQL port (default: 5432)
AWS_ACCESS_KEY_ID           # AWS SES credentials
AWS_SECRET_ACCESS_KEY       # AWS SES credentials
AWS_REGION                  # AWS region (e.g., us-east-1)
RAILS_ENV                   # environment (development/test/production)
RAILS_MAX_THREADS           # Connection pool size
```

### Key Configuration Files
- `/config/database.yml` - PostgreSQL setup
- `/config/cable.yml` - Action Cable adapter (solid_cable in production)
- `/config/routes.rb` - Rodauth mount and route definitions
- `/config/credentials.yml.enc` - Encrypted secrets (decoded with RAILS_MASTER_KEY)
- `Dockerfile` - Multi-stage Docker build
- `compose.yml` - Docker Compose setup for local development

---

## Testing

### Test Structure
- **Unit Tests:** `/test/models/` (Minitest)
- **Fixtures:** `/test/fixtures/` (YAML-based test data)
- **System Tests:** `/test/system/` (Capybara integration)
- **E2E Tests:** `/test/playwright/` (Playwright TypeScript tests)

### Test Commands
```bash
rails test                   # Run all Minitest tests
pnpm typecheck              # TypeScript type checking
pnpm playwright test        # Run Playwright E2E tests
```

### Key Test Fixtures
- accounts.yml
- teams.yml, team_memberships.yml
- memos.yml, memo_editors.yml
- meetings.yml, meeting_participants.yml
- notes.yml, action_items.yml

---

## Deployment

### Docker Build Process
1. Multi-stage Dockerfile (base → build → final)
2. Ruby 3.4.8 on Debian Slim
3. Node 24 for JavaScript build
4. Asset precompilation with ESBuild

### Docker Compose
```bash
docker compose up -d
```
- Runs `rails db:migrate` before app
- Starts Rails server on port 3000
- Uses environment variables from .env

### Production Deployment (Kamal)
- Defined in `/config/deploy.yml`
- Self-hosted with systemd timers
- Auto-update every 2 minutes
- Database-backed cable, queue, cache adapters

---

## Directory Reference

```
/app
  ├── channels/              # Action Cable (SyncChannel)
  ├── controllers/           # 18 REST controllers
  ├── models/                # 16 ActiveRecord models
  ├── views/                 # 20+ ERB view directories
  ├── policies/              # Pundit authorization (3 policies)
  ├── mailers/               # Email (registration, invitations, password reset)
  ├── helpers/               # View helpers
  ├── javascript/            # TypeScript source
  │   ├── controllers/       # 8 Stimulus controllers
  │   └── utils/             # Utility functions
  └── assets/                # CSS, images

/config
  ├── routes.rb              # Route definitions + Rodauth mount
  ├── database.yml           # PostgreSQL 4-database setup
  ├── cable.yml              # Action Cable configuration
  ├── credentials.yml.enc    # Encrypted secrets

/db
  ├── migrate/               # 17 migration files
  └── schema.rb              # Generated schema

/test
  ├── models/                # Unit tests
  ├── fixtures/              # YAML test data
  ├── system/                # Integration tests
  ├── playwright/            # E2E TypeScript tests
  └── test_helper.rb         # Test configuration

/terraform/                  # Infrastructure as Code (AWS)

/public/                     # Static assets

Dockerfile                   # Multi-stage production build
compose.yml                  # Docker Compose for local development
```

---

## Quick Start for Implementation

### Understanding the Code Flow

1. **User Authentication**
   - User logs in via Rodauth (`/login` POST)
   - Session stored with optional remember-me token
   - `current_account` available in controllers/views

2. **Authorization Check**
   - Pundit policies in `/app/policies/`
   - `authorize @object` checks permission
   - Access denied raises Pundit::NotAuthorizedError (handled by Rails)

3. **Real-time Memo Editing**
   - User navigates to `/memos/:id/edit`
   - TipTap editor loads with memo content
   - WebSocket connects to `SyncChannel` for memos:MEMO_ID
   - Y.js CRDT state synced from database
   - Client changes broadcast to all connected editors
   - Changes merged conflict-free via CRDT algorithm
   - Periodic saves to database (updates yjs_state)

4. **Team Invitation**
   - User invites team member with email
   - Token generated, stored in team_invitations table
   - Email sent with `/invitations/:token/accept` link
   - New user clicks link, sets password
   - Account created, invitation auto-accepted (callback)
   - One-on-one memo created for manager-member relationship

5. **Meeting & Notes**
   - Create meeting with participants
   - Add notes with rich text (similar to memo editor)
   - Create action items assigned to participants
   - All stored in database, queryable from meeting#show

### Common Implementation Tasks

**Adding a new REST endpoint:**
1. Create controller action in `/app/controllers/`
2. Add route to `/config/routes.rb`
3. Create view in `/app/views/[controller]/`
4. Add Pundit policy method if authorization needed
5. Write tests in `/test/` (models, system, or Playwright)

**Adding real-time updates:**
1. Use SyncChannel for collaborative data
2. Or create new Action Cable channel for broadcast-only data
3. Create Stimulus controller to handle WebSocket messages
4. Test with Playwright E2E tests

**Adding authorization:**
1. Create policy in `/app/policies/[model]_policy.rb`
2. Define methods: index?, show?, create?, update?, destroy?, custom?
3. Call `authorize @object` in controller
4. Write tests checking policy methods

**Sending emails:**
1. Create mailer in `/app/mailers/`
2. Define method with mail() return
3. Call from model callback or controller
4. In production: AWS SES credentials in env vars

---

## Best Practices for This Codebase

1. **Always verify authentication** before accessing user data
   - Use `authenticate` before_action
   - Access via `current_account`

2. **Always authorize** before modifying records
   - Call `authorize @record` in controller
   - Define policy methods for custom actions

3. **Use Pundit scopes** to safely filter queries
   - `policy_scope(Model)` returns user-accessible records only

4. **Handle invitations consistently**
   - 7-day expiration
   - Token-based (no user login required)
   - Placeholder accounts for uninvited users
   - Auto-acceptance callback when password set

5. **Test real-time features with Playwright**
   - Unit tests for models
   - Playwright for full integration (WebSocket, real-time sync)

6. **Use TypeScript types** in all JavaScript
   - Strict mode enabled
   - Run `pnpm typecheck` before committing

7. **Follow Rails conventions**
   - RESTful routing
   - Active Record associations
   - Model validations & scopes
   - View naming matches actions

8. **Database queries**
   - Use `includes` to prevent N+1 queries
   - Add indexes for foreign keys & filters
   - Write scopes for common queries

9. **Error handling**
   - Rails rescue_from for application errors
   - User-friendly validation messages
   - Proper logging for debugging

10. **Deployment considerations**
    - Environment variables for secrets (never hardcode)
    - Database migrations run before app starts
    - All tests pass before merge
    - Docker images built in CI/CD pipeline

---

## Troubleshooting & Debugging

### WebSocket Connection Issues
- Check SyncChannel configuration in `/config/cable.yml`
- Verify Action Cable is running (check logs)
- Test with browser DevTools → Network → WS

### Real-time Sync Not Working
- Verify `yjs_state` column exists in memos table
- Check Y.js library version consistency
- Look for errors in Rails and JavaScript console logs

### Invitation Emails Not Sent
- Verify AWS SES credentials in environment
- Check email addresses are verified in AWS SES
- Look for exceptions in Rails logs

### Permission Denied Errors
- Check Pundit policy method returns true/false correctly
- Verify `current_account` is set (authentication)
- Review policy scope for collection queries

### Tests Failing
- Run tests locally: `rails test` + `pnpm playwright test`
- Check fixtures have required dependencies
- Verify database is clean: `rails db:test:prepare`
