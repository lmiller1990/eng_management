# CLAUDE.md - Engineering Management Codebase Guide

Quick reference for implementing features in this Rails 8 + Hotwire application.

## Project Summary

Real-time collaborative engineering team management app. Features teams, meetings, notes, action items, and real-time memo editing via CRDT (Y.js). Supports role-based access control and email-based invitations.

## Tech Stack

**Backend:** Ruby 3.4.8, Rails 8.1.1, PostgreSQL 17
**Frontend:** TypeScript, Hotwire (Turbo + Stimulus), Tailwind CSS, TipTap editor
**Real-time:** Y.js + Action Cable (SyncChannel)
**Auth:** Rodauth-Rails 2.1 (email/password)
**Authorization:** Pundit (policy-based)
**Email:** AWS SES
**Testing:** Minitest + Playwright
**Deployment:** Docker + Kamal

See `Gemfile`, `package.json`, `Dockerfile` for full versions.

## Core Concepts

| Concept | Files to Read |
|---------|---|
| **Models & DB Schema** | `/app/models/`, `/db/schema.rb`, `/db/migrate/` |
| **Controllers & Routes** | `/app/controllers/`, `/config/routes.rb` |
| **Views & UI** | `/app/views/`, `/app/javascript/controllers/` |
| **Authentication** | `/config/routes.rb` (Rodauth mount), `/app/models/account.rb` |
| **Authorization** | `/app/policies/` |
| **Real-time Sync** | `/app/channels/sync_channel.rb`, `/app/models/memo.rb` |
| **Emails** | `/app/mailers/` |

## Key Models

- **Account** - User (via Rodauth)
- **Team** - Group of people (owner, admin, member roles)
- **TeamMembership** - Team membership relationships
- **Memo** - Real-time collaborative document (shared or team_one_on_one)
- **MemoEditor** - Who can edit a memo
- **Meeting** - Meeting record
- **MeetingParticipant** - Attendance
- **Note** - Meeting note (rich text)
- **ActionItem** - Task from meeting

See `/app/models/` for associations and logic.

## Essential Routes

```
Authentication:      /login, /create-account, /reset-password-request, /logout
Memos:             GET /memos, GET /memos/:id/edit, POST /memos, PATCH /memos/:id, DELETE /memos/:id
Memo Invitations:  POST /memos/:id/invitations, GET /memo-invitations/:token/accept
Teams:             GET /teams, POST /teams, PATCH /teams/:id, DELETE /teams/:id
Team Invitations:  POST /teams/:id/invitations, GET /invitations/:token/accept
Meetings:          GET /meetings/:id, POST /meetings/:id/participants, POST /meetings/:id/notes
```

See `/config/routes.rb` for complete list.

## Common Patterns

### Authentication
```ruby
current_account     # Access authenticated user
authenticate        # Require auth (before_action)
```

### Authorization
```ruby
authorize @memo     # Check permission (raises Pundit::NotAuthorizedError if denied)
policy_scope(Memo)  # Safely filter records user can access
```

See `/app/policies/` for policy definitions.

### Real-time Editing (Memos)
- Stored in database with binary `yjs_state` column
- WebSocket via `SyncChannel` broadcasts Y.js updates
- Multiple users can edit simultaneously (conflict-free via CRDT)
- TipTap editor with Markdown support

See `/app/channels/sync_channel.rb` and `/app/javascript/controllers/sync_controller.ts`.

### Invitations
- Token-based (7-day expiration)
- Email link: `/invitations/:token/accept` or `/memo-invitations/:token/accept`
- Auto-creates placeholder account if user doesn't exist
- Password setup during acceptance
- Auto-accept pending invitations when account password set (callback)

See `/app/models/team_invitation.rb` and `/app/models/memo_invitation.rb`.

### Views & Controllers
- One controller per resource (e.g., `MenosController`)
- One view directory per controller (e.g., `/app/views/memos/`)
- Action names match view files (show.html.erb, index.html.erb)
- Stimulus controllers in `/app/javascript/controllers/` for interactivity

## Configuration

### Key Files
- `/config/database.yml` - PostgreSQL (4 databases: primary, cache, queue, cable)
- `/config/cable.yml` - Action Cable setup (solid_cable in production)
- `/config/credentials.yml.enc` - Encrypted secrets
- `/config/routes.rb` - Routes + Rodauth configuration
- `Dockerfile` - Production image build
- `compose.yml` - Local development setup

### Environment Variables
```
RAILS_MASTER_KEY        DB_HOST, DB_USER, DB_PASSWORD, DB_PORT
AWS_ACCESS_KEY_ID       AWS_SECRET_ACCESS_KEY       AWS_REGION
RAILS_ENV               RAILS_MAX_THREADS
```

## Testing

- **Unit tests:** `/test/models/` (Minitest)
- **Fixtures:** `/test/fixtures/` (YAML test data)
- **E2E tests:** `/test/playwright/` (TypeScript Playwright)

```bash
rails test                    # Run all tests
pnpm typecheck               # Check TypeScript
pnpm playwright test         # Run E2E tests
```

## Implementation Checklist

**Adding a new REST endpoint:**
1. Create controller action in `/app/controllers/`
2. Add route to `/config/routes.rb`
3. Create view in `/app/views/[controller]/`
4. Add policy method to `/app/policies/` if needed
5. Write tests in `/test/`

**Adding real-time updates:**
1. Use `SyncChannel` for collaborative data or create new Action Cable channel
2. Create Stimulus controller to handle updates in `/app/javascript/controllers/`
3. Test with Playwright

**Adding authorization:**
1. Define policy in `/app/policies/[model]_policy.rb`
2. Call `authorize @object` in controller
3. Write policy tests

**Sending email:**
1. Create mailer in `/app/mailers/`
2. Call from model callback or controller
3. Verify AWS SES is configured with credentials

## Debugging

**WebSocket issues:** Check `/config/cable.yml`, browser DevTools (Network → WS tab)
**Real-time sync fails:** Verify `yjs_state` column, Y.js versions match, check browser console
**Invitations not sending:** Verify AWS SES credentials, email verified in SES console
**Permission denied:** Check Pundit policy returns true/false, verify `current_account` set
**Tests failing:** Run locally with `rails test`, check fixtures, verify DB clean

## Best Practices

1. Check `current_account` before accessing user data
2. Always call `authorize @record` before modifying
3. Use `policy_scope(Model)` to safely filter queries
4. Add TypeScript types to all JavaScript
5. Follow Rails conventions (RESTful routing, associations, validations)
6. Use `includes()` to prevent N+1 queries
7. Write Playwright tests for real-time features
8. Never hardcode secrets—use environment variables
9. Run migrations before deploying
10. Test locally before pushing
