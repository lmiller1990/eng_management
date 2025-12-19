# Infrastructure Plan

## Architecture Overview

Rails 8.1 application with real-time collaborative editing via ActionCable WebSockets. Standard CRUD operations with PostgreSQL persistence. ActionCable uses Solid Cable (database-backed adapter) for broadcasting across multiple EC2 instances.

## AWS Production Environment

### Compute
- EC2 instances in Auto Scaling Group
  - Instance type: t3.medium (production), t3.small (staging)
  - AMI: Ubuntu 22.04 LTS
  - Min: 2, Max: 10 instances (production)
  - Scaling policy: Target tracking on CPU utilization (70%)
  - User data script: Install Ruby, Rails dependencies, application setup
- Application Load Balancer
  - Target group with stickiness enabled (duration-based, 1 hour)
  - Health check: /health endpoint
  - WebSocket upgrade support on port 443
  - Draining timeout: 300 seconds for graceful shutdown

### Data Layer
- RDS PostgreSQL 17
  - Multi-AZ deployment for high availability
  - Instance: db.t4g.medium (production), db.t4g.micro (staging)
  - Automated backups with 7-day retention
  - Read replica for reporting queries (optional, add as needed)
  - Used for: Application data, ActionCable broadcasting (via Solid Cable), Rails cache (via Solid Cache), sessions

### Storage and CDN
- S3 buckets
  - Active Storage attachments (private bucket)
  - Asset pipeline output (public bucket)
- CloudFront distribution
  - Origin: S3 asset bucket
  - Cache compiled assets (CSS, JS)

### Additional Services
- SES for transactional email (password resets, notifications)
- CloudWatch for logs and metrics
- Route53 for DNS
- ACM for SSL certificates
- Secrets Manager for credentials (database, secret_key_base)

### Network
- VPC with public/private subnets across 2 AZs
- EC2 instances in private subnets
- RDS in private subnets
- NAT Gateway for outbound traffic
- Security groups restrict database access to application instances only
- SSH access via bastion host or AWS Systems Manager Session Manager

## Local Development Environment

### Fully Offline Development
Local development requires zero AWS connectivity. All services run on your machine via Docker. No AWS account needed for day-to-day development.

### Docker Compose Stack
Uses existing docker-compose.yml with PostgreSQL:
```
services:
  - postgres:17 (already configured)
```

Note: No Redis needed. ActionCable, cache, and sessions all use the PostgreSQL database via Solid Cable and Solid Cache.

### Local Services
- Rails server via ./bin/dev (Procfile handles Tailwind)
- ActionCable runs in-process (same server, development only)
- PostgreSQL connection: localhost:5432
- Local file storage (not S3) for Active Storage
- Email logged to console (not SES)
- Assets compiled and served by Rails (not CloudFront)

### Configuration Management

#### Environment-Specific Config
- Local: .env file (gitignored)
- AWS: Environment variables injected via user-data script, reading from Secrets Manager
- Shared base: config/database.yml, config/cable.yml with ERB variable interpolation

#### Key Differences by Environment
| Service | Local | AWS Production |
|---------|-------|----------------|
| Database | localhost:5432 | RDS endpoint from env var |
| Storage | local disk | S3 via Active Storage |
| Email | log to console | SES via ActionMailer |
| Assets | served by Rails | S3 + CloudFront |
| SSL | none (HTTP) | ALB terminates SSL |

### Local Development Workflow

1. Start infrastructure: `docker compose up -d`
2. Install dependencies: `bundle install`
3. Setup database: `rails db:setup`
4. Start app: `./bin/dev`
5. Test real-time features: Open multiple browser tabs to localhost:3000
6. Verify ActionCable: Check database-backed broadcasting working across tabs

### Testing Before AWS Deployment

#### Local Multi-Process Testing
Simulate multiple EC2 instances locally:
```
# Terminal 1
RAILS_PORT=3000 rails s

# Terminal 2
RAILS_PORT=3001 rails s

# Both connect to same PostgreSQL database
# Test that collaborative editing works across ports via database polling
```

#### Configuration Validation
- Ensure all production config uses ENV variables, not hardcoded values
- Test with production-like settings: RAILS_ENV=production locally
- Verify Solid Cable adapter works correctly across multiple processes

### Bridging Local and AWS

#### Accessing AWS Resources from Local (optional)
For debugging or data inspection:
- Use SSM Session Manager to tunnel to RDS
- Configure AWS CLI with production credentials
- Set up local.env with production endpoints for testing
- Never commit AWS credentials to git

#### Deployment Testing
1. Test locally with feature branch
2. Push to GitHub
3. CI runs test suite
4. Deploy to staging EC2 instance via Capistrano
5. Verify on staging environment
6. Promote to production if tests pass

## Deployment Strategy

### Application Deployment (Capistrano)
- Git-based deployment to /var/www/app/releases
- Symlink current release to /var/www/app/current
- Shared directories: log, tmp, storage, node_modules
- Process manager: systemd service running Puma
- Rolling deployment: Deploy to instances one at a time

### CI/CD Pipeline (GitHub Actions)
1. Run test suite
2. Trigger Capistrano deployment
3. Capistrano executes on each instance:
   - Pull latest code from Git
   - Bundle install
   - Assets precompile
   - Run migrations (on first instance only)
   - Restart Puma via systemd
   - Health check before moving to next instance

### Environments
- Staging: Single EC2 instance, smaller RDS/Redis instances
- Production: Auto Scaling Group with 2+ instances, Multi-AZ RDS

### Database Migrations
- Run on first instance during deployment
- Advisory locks prevent concurrent migrations
- Prefer backwards-compatible migrations for zero-downtime deploys

## Real-Time Collaboration Considerations

### ActionCable Configuration
- Redis adapter in production (required for multi-instance deployments)
- Sticky sessions on ALB ensure WebSocket connection stability
- Connection pool sizing: configure Redis connections per Puma worker

### Scaling
- Horizontal scaling via Auto Scaling Group
- Redis pub/sub broadcasts editing events across all application instances
- Monitor Redis memory usage as concurrent editing sessions grow

### Monitoring
- CloudWatch metrics: WebSocket connection count, Redis memory
- Application metrics: Active ActionCable connections
- Alert on Redis CPU > 75% or memory > 80%

## Cost Optimization

### Staging Environment
- Single t3.small Spot instance (70% cost savings)
- db.t4g.micro with minimal provisioned IOPS
- cache.t4g.micro Redis instance
- No CloudFront distribution

### Production Environment
- Reserved instances for baseline capacity (2 instances)
- Spot instances in Auto Scaling Group for burst capacity
- S3 lifecycle policies to transition old attachments to Glacier

## Future Considerations

- Add Sidekiq for background job processing (reuse Redis instance)
- CloudWatch Logs Insights for centralized log analysis
- AWS Backup for point-in-time recovery across all resources
- Consider Aurora PostgreSQL if database becomes bottleneck (not needed initially)
