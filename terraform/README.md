# Terraform Infrastructure for AWS SES

This directory contains Terraform configuration for AWS Simple Email Service (SES) infrastructure.

## Prerequisites

1. **AWS Account**: Active AWS account with appropriate permissions
2. **Terraform**: Install Terraform >= 1.0
   ```bash
   brew install terraform  # macOS
   ```
3. **AWS Admin Credentials**: For initial bootstrap (see below)
4. **Domain Access**: Ability to add DNS records for `notae.dev`

## First-Time Setup: Bootstrap Terraform User

**If you haven't created a Terraform IAM user yet**, you need to run the bootstrap first:

```bash
cd terraform/bootstrap
terraform init
terraform apply
```

This creates a dedicated IAM user (`terraform-notae`) for Terraform operations. See [bootstrap/README.md](./bootstrap/README.md) for detailed instructions.

After bootstrap, configure your environment:

```bash
export AWS_PROFILE=terraform-notae
# OR
export AWS_ACCESS_KEY_ID=<from bootstrap output>
export AWS_SECRET_ACCESS_KEY=<from bootstrap output>
```

Then return here to continue with the main infrastructure setup.

## Overview

This Terraform configuration creates:
- **SES Domain Identity**: Verifies `notae.dev` for sending emails
- **DKIM & SPF**: Email authentication to prevent spoofing
- **IAM User**: Dedicated user for Rails application with proper permissions
- **SSM Parameter Store**: Secure credential storage encrypted with KMS
- **SMTP Credentials**: For legacy SMTP authentication

## Quick Start

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Review the Plan

```bash
terraform plan
```

### 3. Apply Configuration

```bash
terraform apply
```

Type `yes` when prompted to create the resources.

### 4. Get Rails Application Credentials

After applying, retrieve your Rails application AWS credentials:

```bash
# Get Rails app credentials (for AWS SDK access)
terraform output -raw rails_app_access_key_id
terraform output -raw rails_app_secret_access_key

# View summary
terraform output rails_app_credentials_summary
```

**See [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed setup instructions.**

#### Alternative: SMTP Credentials

For SMTP-only access, credentials are also available:

```bash
# View all outputs
terraform output

# Get specific sensitive outputs (for testing)
terraform output -raw smtp_username
terraform output -raw smtp_password

# View SSM parameter names
terraform output ssm_parameters
```

#### SSM Parameter Store

The following parameters are automatically created and encrypted with KMS:

**Rails Application Credentials:**
- `/notae/ses/rails_app_access_key_id` - AWS access key ID
- `/notae/ses/rails_app_secret_access_key` - AWS secret access key (encrypted)

**SES Configuration:**
- `/notae/ses/smtp_username` - SMTP username (IAM Access Key ID)
- `/notae/ses/smtp_password` - SMTP password (encrypted)
- `/notae/ses/smtp_endpoint` - SMTP server endpoint
- `/notae/ses/smtp_port` - SMTP port (587)
- `/notae/ses/from_email` - Default from email address
- `/notae/ses/domain` - Verified domain

Your Rails application can read these at runtime:

```bash
# Retrieve parameters using AWS CLI
aws ssm get-parameter --name /notae/ses/smtp_username --query 'Parameter.Value' --output text
aws ssm get-parameter --name /notae/ses/smtp_password --with-decryption --query 'Parameter.Value' --output text
```

### 5. Configure AWS Credentials

Your Rails application needs AWS credentials to access SES and SSM. See the comprehensive guide:

**[AUTHENTICATION.md](./AUTHENTICATION.md)** - Detailed authentication setup for Rails

Quick setup for environment variables:
```bash
export AWS_ACCESS_KEY_ID=$(terraform output -raw rails_app_access_key_id)
export AWS_SECRET_ACCESS_KEY=$(terraform output -raw rails_app_secret_access_key)
export AWS_REGION=ap-southeast-2
```

### 6. Configure DNS Records

Terraform will output DNS records that need to be added to your domain. Get the summary:

```bash
terraform output -json dns_records_summary | jq
```

Add these DNS records to `notae.dev`:

#### Domain Verification (TXT Record)
```
Type: TXT
Name: _amazonses.notae.dev
Value: <verification_token from output>
```

#### DKIM Records (3 CNAME Records)
```
Type: CNAME
Name: <token1>._domainkey.notae.dev
Value: <token1>.dkim.amazonses.com

Type: CNAME
Name: <token2>._domainkey.notae.dev
Value: <token2>.dkim.amazonses.com

Type: CNAME
Name: <token3>._domainkey.notae.dev
Value: <token3>.dkim.amazonses.com
```

#### Mail FROM Domain (MX and SPF Records)
```
Type: MX
Name: mail.notae.dev
Value: 10 feedback-smtp.ap-southeast-2.amazonses.com
Priority: 10

Type: TXT
Name: mail.notae.dev
Value: v=spf1 include:amazonses.com ~all
```

### 7. Verify Domain

After adding DNS records, verify domain status:

```bash
aws ses get-identity-verification-attributes --identities notae.dev
```

Wait for status to change to "Success" (can take up to 72 hours, usually within minutes).

### 8. Request Production Access

By default, SES accounts are in **sandbox mode**, limiting you to:
- Verified email addresses only
- 200 emails per day
- 1 email per second

To send to any email address, request production access:

1. Go to AWS Console → SES → Account dashboard
2. Click "Request production access"
3. Fill out the form:
   - Mail type: Transactional
   - Website URL: Your application URL
   - Use case description: Describe your application and email use case
4. AWS typically approves within 24 hours

## Configuration Variables

Edit values in `variables.tf` or create a `terraform.tfvars` file:

```hcl
aws_region          = "us-east-1"
environment         = "production"
domain              = "notae.dev"
from_email_address  = "notifications@notae.dev"
```

## State Management

For production use, configure S3 backend in `main.tf`:

```hcl
terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "ses/terraform.tfstate"
    region = "us-east-1"
  }
}
```

## Outputs

Key outputs for Rails integration:

- `smtp_username`: IAM access key for SMTP authentication
- `smtp_password`: Generated SMTP password
- `smtp_endpoint`: SES SMTP server endpoint
- `smtp_port`: SMTP port (587)
- `configuration_set_name`: SES configuration set for tracking
- `ssm_parameters`: Map of SSM parameter names for all SES config
- `iam_policy_arn_ssm_read`: IAM policy ARN to attach to application role
- `kms_key_id`: KMS key for decrypting SSM parameters

## Testing SES

Test email sending with AWS CLI:

```bash
aws ses send-email \
  --from notifications@notae.dev \
  --destination ToAddresses=your-email@example.com \
  --message Subject={Data="Test Email",Charset=utf8},Body={Text={Data="Test content",Charset=utf8}}
```

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete all SES configuration and SMTP credentials.

## Next Steps

After completing this setup:
1. Configure Rails Action Mailer with SMTP credentials (see main README)
2. Update Rails configuration files with domain and email addresses
3. Test email delivery in production environment
4. Set up monitoring for bounces and complaints

## Troubleshooting

### Domain verification pending
- Check DNS records are correctly configured
- Wait up to 72 hours for propagation
- Use `dig` to verify DNS records:
  ```bash
  dig TXT _amazonses.notae.dev
  dig CNAME token._domainkey.notae.dev
  ```

### SMTP authentication failing
- Verify credentials from `terraform output`
- Check IAM user has correct permissions
- Ensure using correct SMTP endpoint for region

### Emails not sending
- Verify domain and email identity status in SES console
- Check if account is still in sandbox mode
- Review SES sending statistics and bounce/complaint rates

## Resources

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [SES SMTP Credentials](https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html)
- [Moving out of SES Sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
