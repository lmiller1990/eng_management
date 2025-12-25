# Terraform Infrastructure for AWS SES

This directory contains Terraform configuration for AWS Simple Email Service (SES) infrastructure.

## Prerequisites

1. **AWS Account**: Active AWS account with appropriate permissions
2. **Terraform**: Install Terraform >= 1.0
   ```bash
   brew install terraform  # macOS
   ```
3. **AWS CLI**: Configured with credentials
   ```bash
   aws configure
   ```
4. **Domain Access**: Ability to add DNS records for `notae.dev`

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

### 4. Get SMTP Credentials

After applying, your SMTP credentials are automatically stored in AWS Systems Manager Parameter Store (SSM) for secure access. You can also retrieve them directly:

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

**Important**: To allow your application to read these parameters, attach the IAM policy:
```bash
terraform output iam_policy_arn_ssm_read
```

### 5. Configure DNS Records

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

### 6. Verify Domain

After adding DNS records, verify domain status:

```bash
aws ses get-identity-verification-attributes --identities notae.dev
```

Wait for status to change to "Success" (can take up to 72 hours, usually within minutes).

### 7. Request Production Access

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
