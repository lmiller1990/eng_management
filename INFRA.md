# Infrastructure Plan (Lean)

Small Rails 8.1 app (~tens of users). Low cost, low ops. No Redis; ActionCable/cache/sessions use Postgres.

## AWS Production (single instance)
- Compute: EC2 `t4g.small` (ARM, cheaper); use `t3.small` if x86_64 is required. Ubuntu 22.04. Elastic IP. SG: 80/443 open, SSH via SSM only.
- TLS/routing: Nginx + Let’s Encrypt on the box (can skip Nginx and terminate TLS elsewhere if desired).
- App server: Puma via systemd under `/var/www/app`.
- Database: Prefer RDS Postgres 17 `db.t4g.micro`, single-AZ, 20 GB gp3, 7-day backups. Cheapest alternative: Postgres on the same EC2 with a dedicated EBS volume; nightly `pg_dump` to S3 + weekly EBS snapshots (no HA, more ops).
- Storage: One S3 bucket for Active Storage. Serve compiled assets directly from Rails (no CloudFront).
- Email: SES (prod). Local/dev logs emails to console.
- DNS: Route53 hosted zone. `A/AAAA` to Elastic IP. `www` -> apex redirect in Nginx.
- Network: Simple VPC, one public subnet. If using RDS, place it private and restrict to the app SG on 5432. No NAT Gateway.
- Deploys: Capistrano or simple SSH script: git pull, bundle install, db:migrate, assets:precompile, restart Puma. Env/secrets from SSM Parameter Store or Secrets Manager.
- Monitoring/logging: CloudWatch Agent for system/app logs and memory/disk metrics; alarms on CPU/disk/full storage (and RDS FreeStorageSpace if used). Add uptime check (Route53 health check or external).

## Local Development
- Existing Docker Postgres; `./bin/dev` for Rails + Tailwind. Active Storage on disk; emails to console.

## Notes
- Single instance keeps cost low; downtime during reboots/deploys is acceptable.
- ARM is for cost; fall back to `t3.small` if any x86-only dependency appears.
- Scale path: move to RDS if on-box Postgres; then add ALB + second EC2 if uptime/traffic demands.
