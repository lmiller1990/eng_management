# Domain Model for Engineering Management Platform

## Overview
Platform for Engineering Managers to manage meetings with their team members, including note-taking and action item tracking.

## Core Entities

### 1. Accounts (existing)
Already handled by Rodauth authentication.

### 2. Meetings
Represents a meeting.

**Table: `meetings`**
```ruby
- id (primary key)
- created_at (datetime)
- updated_at (datetime)
```

### 3. MeetingParticipants
Join table for the many-to-many relationship between Accounts and Meetings.

**Table: `meeting_participants`**
```ruby
- id (primary key)
- meeting_id (foreign key -> meetings)
- account_id (foreign key -> accounts)
- created_at (datetime)
- updated_at (datetime)
```

### 4. Notes
Stores meeting notes with rich text content (for tiptap editor).

**Table: `notes`**
```ruby
- id (primary key)
- meeting_id (foreign key -> meetings)
- account_id (foreign key -> accounts)
- content (text) # JSON content for tiptap (ProseMirror format)
- created_at (datetime)
- updated_at (datetime)
```

### 5. ActionItems
Tracks action items created during meetings.

**Table: `action_items`**
```ruby
- id (primary key)
- meeting_id (foreign key -> meetings)
- account_id (foreign key -> accounts) # assignee
- title (string, not null)
- created_at (datetime)
- updated_at (datetime)
```

## Relationships

```
Account
├── has_many :meeting_participants
├── has_many :meetings, through: :meeting_participants
├── has_many :notes
└── has_many :action_items

Meeting
├── has_many :meeting_participants
├── has_many :accounts, through: :meeting_participants
├── has_many :notes
└── has_many :action_items

MeetingParticipant
├── belongs_to :meeting
└── belongs_to :account

Note
├── belongs_to :meeting
└── belongs_to :account

ActionItem
├── belongs_to :meeting
└── belongs_to :account
```

## Rails Scaffold Commands

```bash
rails generate scaffold Meeting
rails generate scaffold MeetingParticipant meeting:references account:references
rails generate scaffold Note meeting:references account:references content:text
rails generate scaffold ActionItem meeting:references account:references title:string
```
