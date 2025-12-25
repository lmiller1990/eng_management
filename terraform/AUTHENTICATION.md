# AWS Authentication for Rails Application

This document explains how your Rails application authenticates with AWS to access SES and SSM Parameter Store.

## Authentication Method: IAM User with Access Keys

Since you're deploying to your own servers (non-AWS infrastructure), the Rails application uses an **IAM user with access keys**.

### IAM User Created
- **Name**: `production-rails-app`
- **Permissions**:
  - Send emails via SES (SMTP and AWS SDK)
  - Read SES configuration from SSM Parameter Store
  - Get SES send quota and statistics

## Getting Your Credentials

After running `terraform apply`, retrieve your credentials:

```bash
# Get access key ID
terraform output -raw rails_app_access_key_id

# Get secret access key
terraform output -raw rails_app_secret_access_key

# View summary
terraform output rails_app_credentials_summary
```

These credentials are also automatically stored in SSM Parameter Store at:
- `/notae/ses/rails_app_access_key_id`
- `/notae/ses/rails_app_secret_access_key`

## Configuring Rails

### Option 1: Environment Variables (Recommended for Self-Hosted)

Add these environment variables to your Rails application:

```bash
AWS_ACCESS_KEY_ID=<from terraform output>
AWS_SECRET_ACCESS_KEY=<from terraform output>
AWS_REGION=ap-southeast-2
```

#### For Kamal Deployment

Add to your `.kamal/secrets` file or Kamal secrets management:

```bash
# .kamal/secrets (make sure this file is in .gitignore!)
AWS_ACCESS_KEY_ID=$(terraform -chdir=terraform output -raw rails_app_access_key_id)
AWS_SECRET_ACCESS_KEY=$(terraform -chdir=terraform output -raw rails_app_secret_access_key)
AWS_REGION=ap-southeast-2
```

Then reference in your `config/deploy.yml`:

```yaml
env:
  secret:
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
  clear:
    AWS_REGION: ap-southeast-2
```

#### For Systemd Services

Create an environment file:

```bash
# /etc/notae/rails.env
AWS_ACCESS_KEY_ID=<from terraform output>
AWS_SECRET_ACCESS_KEY=<from terraform output>
AWS_REGION=ap-southeast-2
```

Secure the file:
```bash
sudo chmod 600 /etc/notae/rails.env
sudo chown rails:rails /etc/notae/rails.env
```

Reference in systemd service:
```ini
[Service]
EnvironmentFile=/etc/notae/rails.env
```

### Option 2: AWS Credentials File

Create `~/.aws/credentials`:

```ini
[default]
aws_access_key_id = <from terraform output>
aws_secret_access_key = <from terraform output>
```

Create `~/.aws/config`:

```ini
[default]
region = ap-southeast-2
```

Secure the files:
```bash
chmod 600 ~/.aws/credentials
chmod 600 ~/.aws/config
```

### Option 3: Rails Encrypted Credentials

Store in `config/credentials.yml.enc`:

```yaml
aws:
  access_key_id: <from terraform output>
  secret_access_key: <from terraform output>
  region: ap-southeast-2
```

Edit with:
```bash
EDITOR=vim rails credentials:edit
```

Access in Rails:
```ruby
Aws.config.update({
  region: Rails.application.credentials.dig(:aws, :region),
  credentials: Aws::Credentials.new(
    Rails.application.credentials.dig(:aws, :access_key_id),
    Rails.application.credentials.dig(:aws, :secret_access_key)
  )
})
```

## Security Best Practices

### 1. Never Commit Credentials
Add to `.gitignore`:
```
.kamal/secrets
.env
*.env
config/credentials/*.key
.aws/credentials
```

### 2. Rotate Access Keys Regularly
Rotate credentials every 90 days:

```bash
# Create new access key
aws iam create-access-key --user-name production-rails-app

# Update your environment variables with new keys

# Delete old access key
aws iam delete-access-key --user-name production-rails-app --access-key-id <old-key-id>
```

### 3. Monitor Access Key Usage
Check last usage:
```bash
aws iam get-access-key-last-used --access-key-id <key-id>
```

### 4. Use Least Privilege
The IAM user only has permissions for:
- SES operations (send email, check quota)
- SSM read access (only `/notae/ses/*` parameters)

### 5. Enable CloudTrail
Monitor all API calls made by the IAM user:
```bash
aws cloudtrail lookup-events --lookup-attributes AttributeKey=Username,AttributeValue=production-rails-app
```

## How the AWS SDK Uses These Credentials

The AWS SDK for Ruby automatically discovers credentials in this order:

1. **Environment variables**: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
2. **Shared credentials file**: `~/.aws/credentials`
3. **IAM instance profile** (not applicable for self-hosted)

When you configure Action Mailer with AWS SES, the SDK will automatically use these credentials:

```ruby
config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  address:              ENV['SMTP_ENDPOINT'],
  port:                 587,
  user_name:            ENV['SMTP_USERNAME'],
  password:             ENV['SMTP_PASSWORD'],
  authentication:       :plain,
  enable_starttls_auto: true
}
```

## Troubleshooting

### Credentials not found
```ruby
Aws::Errors::NoSuchEndpointError (missing credentials)
```

**Solution**: Ensure environment variables are set or credentials file exists.

### Access Denied
```ruby
Aws::SES::Errors::AccessDenied
```

**Solution**: Verify IAM user has correct policies attached:
```bash
aws iam list-user-policies --user-name production-rails-app
aws iam list-attached-user-policies --user-name production-rails-app
```

### Wrong Region
```ruby
Aws::SES::Errors::InvalidParameterValue (domain not verified)
```

**Solution**: Ensure `AWS_REGION=ap-southeast-2` matches your SES configuration.

## Future: Migrating to EC2 Instance Roles

If you migrate to EC2 in the future, you can use IAM instance roles (more secure):

1. Create EC2 instance role with same permissions
2. Attach role to EC2 instance
3. Remove AWS access keys from environment variables
4. AWS SDK will automatically use instance role credentials

This eliminates the need to manage access keys entirely.

## Need Help?

Run this command to verify your setup:

```bash
# Test AWS credentials
aws sts get-caller-identity

# Test SES access
aws ses get-send-quota

# Test SSM access
aws ssm get-parameter --name /notae/ses/domain
```
