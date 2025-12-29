# Performance Rubric Tracking System Implementation Plan

## Overview
Implement a performance tracking system for engineering team members based on a competency rubric with 17 competencies across 5 categories. System will track current ratings (1-5 scale) for each employee-competency pair with multiple timestamped notes.

## Data Model (4 New Models)

### 1. Competency
- Universal competencies (e.g., "Implementation", "Design & Architecture")
- Fields: name (unique), category (enum), display_order
- Categories: craft_and_technical, execution_and_delivery, collaboration_and_communication, culture_and_values, industry_and_mission

### 2. CompetencyDescription
- Role-specific descriptions for each competency at each level
- Fields: competency_id (FK), role_level (1-5), description (text)
- Unique constraint: [competency_id, role_level]

### 3. AccountCompetencyRating
- Current rating for account-competency pair (no history)
- Fields: account_id (FK), competency_id (FK), rating (1-5, nullable for N/A)
- Unique constraint: [account_id, competency_id]

### 4. CompetencyNote
- Multiple timestamped notes per rating
- Fields: account_competency_rating_id (FK), author_id (FK to accounts), content (text)

### 5. Update Account Model
- Add field: current_role_level (integer, default: 1)
- Determines which competency descriptions to show

## Implementation Steps

### Step 1: Create Migrations (5 files)

**Migration 1:** `db/migrate/YYYYMMDDHHMMSS_create_competencies.rb`
- Create competencies table (name, category, display_order)
- Indexes: name (unique), category, [category, display_order]

**Migration 2:** `db/migrate/YYYYMMDDHHMMSS_create_competency_descriptions.rb`
- Create competency_descriptions table
- Indexes: [competency_id, role_level] (unique)

**Migration 3:** `db/migrate/YYYYMMDDHHMMSS_create_account_competency_ratings.rb`
- Create account_competency_ratings table
- Indexes: [account_id, competency_id] (unique), rating

**Migration 4:** `db/migrate/YYYYMMDDHHMMSS_create_competency_notes.rb`
- Create competency_notes table
- Indexes: created_at, author_id

**Migration 5:** `db/migrate/YYYYMMDDHHMMSS_add_current_role_level_to_accounts.rb`
- Add current_role_level to accounts (integer, default: 1)
- Index: current_role_level

### Step 2: Create Models (4 files)

**File:** `app/models/competency.rb`
- Associations: has_many :competency_descriptions, :account_competency_ratings
- Validations: name (presence, uniqueness, length), category (presence), display_order (presence, integer)
- Enum: category (5 categories)
- Scopes: ordered, by_category

**File:** `app/models/competency_description.rb`
- Associations: belongs_to :competency
- Validations: competency_id, role_level (1-5), description (presence, min 10 chars), uniqueness [role_level, competency_id]
- Scopes: for_level, ordered

**File:** `app/models/account_competency_rating.rb`
- Associations: belongs_to :account, :competency; has_many :competency_notes
- Validations: account_id, competency_id, uniqueness [account_id, competency_id], rating (1-5 or nil)
- Methods: rated?, rating_label (returns text description)
- Scopes: rated, unrated, by_rating

**File:** `app/models/competency_note.rb`
- Associations: belongs_to :account_competency_rating, belongs_to :author (Account)
- Validations: account_competency_rating_id, author_id, content (presence)
- Scopes: recent, by_author

**Update:** `app/models/account.rb`
- Add associations: has_many :account_competency_ratings, :authored_competency_notes
- Add method: role_level_name (returns "Junior Engineer", etc.)

### Step 3: Seed Rubric Data

**Copy CSV:** `/Users/lachlan/Downloads/rubric.csv` → `db/seeds/rubric.csv`

**Create:** `db/seeds/rubric_seed.rb`
- Parse CSV to extract competencies and descriptions
- Map CSV columns to role levels (columns 1-6 → levels 1-5)
- Map category headers to enum values
- Use find_or_create_by! to avoid duplicates
- Create Competency records with category and display_order
- Create CompetencyDescription records for each role level

**Update:** `db/seeds.rb`
- Add: `load Rails.root.join('db', 'seeds', 'rubric_seed.rb')`

### Step 4: Create Controllers (3 files)

**File:** `app/controllers/accounts_controller.rb` (NEW)
- index: List all verified accounts
- show: Redirect to performance_review_path

**File:** `app/controllers/performance_reviews_controller.rb`
- show: Display account's performance review (read-only)
  - Load competencies (ordered, with descriptions)
  - Load ratings with notes
  - Group by category
  - Authorization: current_account == @account || admin

- edit: Edit account's performance review (admin only)
  - Same data as show, plus rating forms
  - Authorization: admin only

**File:** `app/controllers/account_competency_ratings_controller.rb`
- update: Update or create rating for account-competency
  - Find or initialize rating
  - Accept rating value (1-5 or "null" for N/A)
  - Auto-submit via Turbo
  - Authorization: admin only

**File:** `app/controllers/competency_notes_controller.rb`
- create: Add note to rating
- edit: Edit existing note (author or admin)
- update: Update note (author or admin)
- destroy: Delete note (author or admin)

### Step 5: Create Routes

**Update:** `config/routes.rb`
```ruby
resources :accounts, only: [:index, :show] do
  resource :performance_review, only: [:show, :edit], controller: "performance_reviews"
  resources :competency_ratings, only: [:update], controller: "account_competency_ratings"
end

resources :competency_notes, only: [:create, :edit, :update, :destroy]
```

### Step 6: Create Views (5 files)

**File:** `app/views/accounts/index.html.erb`
- Table of verified accounts with email, name, role level
- "View Review" button links to performance_review_path

**File:** `app/views/performance_reviews/show.html.erb`
- Header with account info and role level badge
- Rating scale legend (1-5)
- Competencies grouped by category
- For each competency:
  - Name with current rating badge
  - Role-specific description
  - Existing notes with author/timestamp
  - Edit/Delete buttons for own notes
- "Edit Ratings" button (admin only)

**File:** `app/views/performance_reviews/edit.html.erb`
- Same layout as show
- Radio buttons for rating (1-5, N/A) with auto-submit
- "Add Note" form inline
- Previous notes displayed
- "Done" button to return to show view

**File:** `app/views/competency_notes/edit.html.erb`
- Simple form to edit note content
- Save/Cancel buttons

**File:** `app/views/layouts/application.html.erb`
- Add navigation link to /accounts with star icon and "Performance" label

### Step 7: Authorization Pattern

Follow existing manual authorization (like TeamsController):
- `before_action :authorize_access` - Check current_account == @account || admin
- `before_action :authorize_edit_access` - Check admin only
- `before_action :authorize_note_access` - Check author == current_account || admin

## Critical Files to Modify/Create

**Models:**
- `app/models/competency.rb` (new)
- `app/models/competency_description.rb` (new)
- `app/models/account_competency_rating.rb` (new)
- `app/models/competency_note.rb` (new)
- `app/models/account.rb` (update)

**Controllers:**
- `app/controllers/accounts_controller.rb` (new)
- `app/controllers/performance_reviews_controller.rb` (new)
- `app/controllers/account_competency_ratings_controller.rb` (new)
- `app/controllers/competency_notes_controller.rb` (new)

**Views:**
- `app/views/accounts/index.html.erb` (new)
- `app/views/performance_reviews/show.html.erb` (new)
- `app/views/performance_reviews/edit.html.erb` (new)
- `app/views/competency_notes/edit.html.erb` (new)
- `app/views/layouts/application.html.erb` (update navigation)

**Config:**
- `config/routes.rb` (update)

**Database:**
- 5 migration files (create tables, add column)
- `db/seeds/rubric_seed.rb` (new)
- `db/seeds.rb` (update)
- `db/seeds/rubric.csv` (copy from Downloads)

## Execution Order

1. Generate and run migrations 1-5
2. Create all 4 model files + update Account model
3. Copy CSV file to db/seeds/
4. Create rubric_seed.rb and update seeds.rb
5. Run `rails db:seed` to populate competencies
6. Create all 4 controller files
7. Update routes.rb
8. Create all 5 view files
9. Update application layout navigation
10. Test: View accounts → Select account → View review → Edit ratings → Add notes

## UI/UX Details

**DaisyUI Components:**
- Buttons: `btn btn-primary`, `btn btn-ghost`, `btn-sm`
- Badges: `badge badge-primary` (for role level), `badge-{error,warning,success,info,accent}` (for ratings 1-5)
- Forms: `form-control`, `input input-bordered`, `textarea textarea-bordered`, `radio radio-primary`
- Cards: `card bg-base-100 shadow`, `card-body`
- Tables: `table` with `thead`, `tbody`
- Layout: `max-w-7xl`, `space-y-6`, `flex gap-2`

**Rating Badge Colors:**
- 1 (Not Attempting): badge-error
- 2 (Developing): badge-warning
- 3 (Competent): badge-success
- 4 (Advanced): badge-info
- 5 (Outstanding): badge-accent
- N/A: badge-ghost

**Auto-save:**
- Rating radio buttons trigger form submission via Turbo
- Notes added via Turbo forms (no page reload)

## Edge Cases

1. **Missing role level:** Default to level 1 if account.current_role_level is nil
2. **Missing descriptions:** Some competencies may not have descriptions for all 5 levels in CSV
3. **Null ratings:** Allow rating to be NULL for "Not Applicable" competencies
4. **Authorization:** Non-admins can only view own review and add notes to own review
5. **Note deletion:** Only note author or admin can delete notes
6. **CSV parsing:** Handle empty cells, special characters, category vs competency rows

## Future Enhancements (Not in scope)

- Historical rating tracking (rating_history table)
- Manager relationships (manager_id on accounts)
- Review cycles (quarterly, annual)
- Export to PDF
- Email notifications
- Charts/visualization
- Goal setting integration
