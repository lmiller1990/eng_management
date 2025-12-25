# IAM User for Rails Application
# This user has permissions to:
# 1. Send emails via SES (both SMTP and AWS SDK)
# 2. Read SES configuration from SSM Parameter Store

resource "aws_iam_user" "rails_app" {
  name = "${var.environment}-rails-app"
  path = "/applications/"

  tags = {
    Description = "IAM user for Rails application to access SES and SSM"
    Application = "notae"
  }
}

# Access Key for Rails Application
resource "aws_iam_access_key" "rails_app" {
  user = aws_iam_user.rails_app.name
}

# Policy for SES sending via AWS SDK
resource "aws_iam_user_policy" "rails_app_ses" {
  name = "ses-send-email"
  user = aws_iam_user.rails_app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:GetSendQuota",
          "ses:GetSendStatistics"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach SSM read policy to Rails application user
resource "aws_iam_user_policy_attachment" "rails_app_ssm" {
  user       = aws_iam_user.rails_app.name
  policy_arn = aws_iam_policy.ssm_read_ses.arn
}

# Store Rails app credentials in SSM for easy retrieval
resource "aws_ssm_parameter" "rails_app_access_key_id" {
  name        = "${var.ssm_parameter_prefix}/rails_app_access_key_id"
  description = "Rails application AWS access key ID"
  type        = "SecureString"
  value       = aws_iam_access_key.rails_app.id
  key_id      = aws_kms_key.ssm.key_id

  tags = {
    Name = "Rails App Access Key ID"
  }
}

resource "aws_ssm_parameter" "rails_app_secret_access_key" {
  name        = "${var.ssm_parameter_prefix}/rails_app_secret_access_key"
  description = "Rails application AWS secret access key"
  type        = "SecureString"
  value       = aws_iam_access_key.rails_app.secret
  key_id      = aws_kms_key.ssm.key_id

  tags = {
    Name = "Rails App Secret Access Key"
  }
}
