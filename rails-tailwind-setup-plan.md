# Ruby on Rails + Tailwind CSS Setup Plan

## Overview
This plan outlines the steps to set up a modern Ruby on Rails web application with Tailwind CSS for styling.

## Prerequisites

### System Requirements
- Ruby 3.0 or higher
- Node.js 14 or higher (for asset compilation)
- SQLite3, PostgreSQL, or MySQL (database)
- Git (version control)

### Installation Steps

1. **Install Ruby**
   - macOS: Use rbenv or rvm
     ```bash
     brew install rbenv ruby-build
     rbenv install 3.3.0
     rbenv global 3.3.0
     ```
   - Linux: Use rbenv or system package manager
   - Windows: Use RubyInstaller

2. **Install Rails**
   ```bash
   gem install rails
   rails --version
   ```

3. **Install Node.js**
   - macOS: `brew install node`
   - Linux: Use nvm or system package manager
   - Windows: Download from nodejs.org

## Project Setup

### 1. Create New Rails Application

```bash
rails new my_app --css=tailwind
cd my_app
```

This creates a new Rails 7+ app with Tailwind CSS pre-configured using the `tailwindcss-rails` gem.

**Alternative: Manual Tailwind Setup**
If creating without `--css=tailwind`:
```bash
rails new my_app
cd my_app
./bin/bundle add tailwindcss-rails
./bin/rails tailwindcss:install
```

### 2. Database Setup

```bash
rails db:create
rails db:migrate
```

### 3. Start Development Server

```bash
./bin/dev
```

This starts both the Rails server and Tailwind CSS build process using Foreman.

## Project Structure

```
my_app/
├── app/
│   ├── assets/
│   │   └── stylesheets/
│   │       └── application.tailwind.css  # Tailwind entry point
│   ├── controllers/
│   ├── models/
│   ├── views/
│   │   └── layouts/
│   │       └── application.html.erb      # Main layout
│   └── javascript/
├── config/
│   ├── routes.rb                         # Application routes
│   ├── database.yml                      # Database configuration
│   └── tailwind.config.js                # Tailwind configuration
├── db/
│   └── migrate/                          # Database migrations
├── public/
├── Gemfile                               # Ruby dependencies
└── package.json                          # JavaScript dependencies
```

## Tailwind CSS Configuration

### Default Setup
The `--css=tailwind` flag configures:
- `tailwindcss-rails` gem
- `application.tailwind.css` with Tailwind directives
- Tailwind configuration file
- Build process integration

### Customization
Edit `config/tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors
      }
    }
  },
  plugins: [
    // Tailwind plugins
  ]
}
```

## Development Workflow

### 1. Generate Resources
```bash
# Generate scaffold (model, views, controller)
rails generate scaffold Post title:string content:text

# Generate model only
rails generate model User name:string email:string

# Generate controller only
rails generate controller Pages home about
```

### 2. Run Migrations
```bash
rails db:migrate
```

### 3. Style with Tailwind
Use Tailwind utility classes in views:
```erb
<div class="container mx-auto px-4">
  <h1 class="text-3xl font-bold text-gray-900">Welcome</h1>
  <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    Click me
  </button>
</div>
```

### 4. Testing
```bash
# Run tests
rails test

# Run specific test
rails test test/models/post_test.rb
```

## Essential Gems to Consider

- **devise**: User authentication
- **pundit** or **cancancan**: Authorization
- **kaminari** or **pagy**: Pagination
- **ransack**: Search functionality
- **sidekiq**: Background jobs
- **rspec-rails**: Testing framework (alternative to Minitest)

## Deployment Preparation

### 1. Production Database
Update `config/database.yml` for production (typically PostgreSQL)

### 2. Environment Variables
Use `dotenv-rails` gem or Rails credentials:
```bash
rails credentials:edit
```

### 3. Asset Precompilation
```bash
rails assets:precompile
```

### 4. Deployment Platforms
- Heroku
- Render
- Fly.io
- AWS/DigitalOcean with Capistrano

## Next Steps

1. Set up version control (Git)
2. Create initial models and migrations
3. Set up authentication (if needed)
4. Design database schema
5. Create main application layout with Tailwind
6. Build core features
7. Add tests
8. Set up CI/CD pipeline
9. Deploy to staging environment
10. Deploy to production

## Useful Commands

```bash
# Start console
rails console

# Check routes
rails routes

# Generate migration
rails generate migration AddFieldToModel field:type

# Rollback migration
rails db:rollback

# Reset database
rails db:reset

# Run linter
rubocop

# Update dependencies
bundle update
```

## Resources

- Rails Guides: https://guides.rubyonrails.org
- Tailwind CSS Docs: https://tailwindcss.com/docs
- Rails API Documentation: https://api.rubyonrails.org
- Tailwind UI Components: https://tailwindui.com
