# KMS Key for encrypting SSM parameters
resource "aws_kms_key" "ssm" {
  description             = "KMS key for encrypting SES credentials in SSM Parameter Store"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = {
    Name = "${var.environment}-ses-ssm-key"
  }
}

resource "aws_kms_alias" "ssm" {
  name          = "alias/${var.environment}-ses-ssm"
  target_key_id = aws_kms_key.ssm.key_id
}

# SSM Parameter for SMTP Username
resource "aws_ssm_parameter" "smtp_username" {
  name        = "${var.ssm_parameter_prefix}/smtp_username"
  description = "SES SMTP username (IAM Access Key ID)"
  type        = "SecureString"
  value       = aws_iam_access_key.smtp.id
  key_id      = aws_kms_key.ssm.key_id

  tags = {
    Name = "SES SMTP Username"
  }
}

# SSM Parameter for SMTP Password
resource "aws_ssm_parameter" "smtp_password" {
  name        = "${var.ssm_parameter_prefix}/smtp_password"
  description = "SES SMTP password (generated from IAM Secret Access Key)"
  type        = "SecureString"
  value       = local.smtp_password
  key_id      = aws_kms_key.ssm.key_id

  tags = {
    Name = "SES SMTP Password"
  }
}

# SSM Parameter for SMTP Endpoint
resource "aws_ssm_parameter" "smtp_endpoint" {
  name        = "${var.ssm_parameter_prefix}/smtp_endpoint"
  description = "SES SMTP endpoint for the configured region"
  type        = "String"
  value       = "email-smtp.${var.aws_region}.amazonaws.com"

  tags = {
    Name = "SES SMTP Endpoint"
  }
}

# SSM Parameter for SMTP Port
resource "aws_ssm_parameter" "smtp_port" {
  name        = "${var.ssm_parameter_prefix}/smtp_port"
  description = "SES SMTP port"
  type        = "String"
  value       = "587"

  tags = {
    Name = "SES SMTP Port"
  }
}

# SSM Parameter for From Email Address
resource "aws_ssm_parameter" "from_email" {
  name        = "${var.ssm_parameter_prefix}/from_email"
  description = "Default from email address"
  type        = "String"
  value       = var.from_email_address

  tags = {
    Name = "SES From Email Address"
  }
}

# SSM Parameter for Domain
resource "aws_ssm_parameter" "domain" {
  name        = "${var.ssm_parameter_prefix}/domain"
  description = "Verified SES domain"
  type        = "String"
  value       = var.domain

  tags = {
    Name = "SES Domain"
  }
}

# IAM Policy for reading SES SSM parameters
resource "aws_iam_policy" "ssm_read_ses" {
  name        = "${var.environment}-ssm-read-ses-params"
  description = "Allow reading SES configuration from SSM Parameter Store"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:*:parameter${var.ssm_parameter_prefix}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = aws_kms_key.ssm.arn
      }
    ]
  })
}
