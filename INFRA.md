# Infrastructure Plan (Lean)

Small Rails 8.1 app (~tens of users). Low cost, low ops. No Redis; ActionCable/cache/sessions use Postgres.

## Terraform / SES
- New Terraform stacks live under `infra/terraform`:
  - `bootstrap/`: creates the remote state backend (S3 bucket + DynamoDB lock). Uses local state to run once.
  - `ses/`: configures SES for `notae.dev` with DKIM, Mail-From (`mail.notae.dev`), DMARC (`p=none; rua=mailto:dmarc@notae.dev`), and an IAM send-only SMTP user.
- Usage (after installing terraform):
  - Bootstrap backend: `terraform -chdir=infra/terraform/bootstrap init && terraform -chdir=infra/terraform/bootstrap apply`.
  - Copy `infra/terraform/ses/backend.hcl.example` to `backend.hcl`, adjust bucket/table names if needed, then: `terraform -chdir=infra/terraform/ses init -backend-config=backend.hcl` and `terraform -chdir=infra/terraform/ses apply -var-file=terraform.tfvars` (edit the example first).

### Outstanding/next steps
- Register/purchase `notae.dev` and decide final DNS home. If using Route53, keep `create_route53_zone=true`; otherwise set `existing_hosted_zone_id` and point the registrar to the Route53 nameservers after creation.
- SES sandbox exit: after DNS propagates and identity verifies, request production access in SES console (needed to send to arbitrary recipients).
- Create/alias a DMARC inbox (e.g., `dmarc@notae.dev`) to receive aggregate reports.
- If DNS is *not* managed in Route53, apply the stack with `create_route53_zone=false`, then add the output DNS records manually to your DNS host.
- Store the SMTP creds from Terraform outputs somewhere safe (not in git); use `email-smtp.ap-southeast-2.amazonaws.com` on port 587/465 in the app’s SMTP settings.
