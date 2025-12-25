# SES Domain Identity
resource "aws_ses_domain_identity" "main" {
  domain = var.domain
}

# SES Domain Verification (TXT record)
resource "aws_ses_domain_identity_verification" "main" {
  domain = aws_ses_domain_identity.main.id

  depends_on = [aws_ses_domain_identity.main]
}

# DKIM Configuration for domain
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# SES Domain Mail From
resource "aws_ses_domain_mail_from" "main" {
  domain           = aws_ses_domain_identity.main.domain
  mail_from_domain = "mail.${aws_ses_domain_identity.main.domain}"
}

# Configuration Set for tracking email events
resource "aws_ses_configuration_set" "main" {
  count = var.enable_configuration_set ? 1 : 0
  name  = "${var.environment}-email-events"

  delivery_options {
    tls_policy = "Require"
  }
}

# IAM User for SMTP Authentication
resource "aws_iam_user" "smtp" {
  name = "${var.environment}-ses-smtp-user"
  path = "/ses/"

  tags = {
    Description = "IAM user for SES SMTP authentication"
  }
}

# IAM Access Key for SMTP User
resource "aws_iam_access_key" "smtp" {
  user = aws_iam_user.smtp.name
}

# IAM Policy for sending emails
resource "aws_iam_user_policy" "smtp" {
  name = "ses-send-email"
  user = aws_iam_user.smtp.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# Email Identity for the from address
resource "aws_ses_email_identity" "from_address" {
  email = var.from_email_address
}

# Generate SES SMTP password from IAM secret access key
# This uses the AWS SES SMTP password conversion algorithm
locals {
  # SES SMTP credentials conversion (AWS Signature Version 4)
  smtp_password = aws_iam_access_key.smtp.ses_smtp_password_v4
}
