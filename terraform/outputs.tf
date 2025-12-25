output "ses_domain_identity_arn" {
  description = "ARN of the SES domain identity"
  value       = aws_ses_domain_identity.main.arn
}

output "ses_domain_identity_verification_token" {
  description = "Verification token for SES domain (add this as TXT record)"
  value       = aws_ses_domain_identity.main.verification_token
}

output "ses_dkim_tokens" {
  description = "DKIM tokens to add as CNAME records"
  value       = aws_ses_domain_dkim.main.dkim_tokens
}

output "mail_from_domain" {
  description = "Mail FROM domain (add MX and SPF records)"
  value       = aws_ses_domain_mail_from.main.mail_from_domain
}

output "smtp_username" {
  description = "SMTP username (IAM Access Key ID)"
  value       = aws_iam_access_key.smtp.id
  sensitive   = true
}

output "smtp_password" {
  description = "SMTP password (generated from IAM Secret Access Key)"
  value       = local.smtp_password
  sensitive   = true
}

output "smtp_endpoint" {
  description = "SMTP endpoint for the configured region"
  value       = "email-smtp.${var.aws_region}.amazonaws.com"
}

output "smtp_port" {
  description = "SMTP port (use 587 for TLS or 465 for SSL)"
  value       = 587
}

output "configuration_set_name" {
  description = "Name of the SES configuration set"
  value       = var.enable_configuration_set ? aws_ses_configuration_set.main[0].name : null
}

output "dns_records_summary" {
  description = "Summary of DNS records to configure"
  value = {
    domain_verification = {
      type  = "TXT"
      name  = "_amazonses.${var.domain}"
      value = aws_ses_domain_identity.main.verification_token
    }
    dkim_records = [
      for token in aws_ses_domain_dkim.main.dkim_tokens : {
        type  = "CNAME"
        name  = "${token}._domainkey.${var.domain}"
        value = "${token}.dkim.amazonses.com"
      }
    ]
    mail_from_mx = {
      type     = "MX"
      name     = aws_ses_domain_mail_from.main.mail_from_domain
      value    = "10 feedback-smtp.${var.aws_region}.amazonses.com"
      priority = 10
    }
    mail_from_spf = {
      type  = "TXT"
      name  = aws_ses_domain_mail_from.main.mail_from_domain
      value = "v=spf1 include:amazonses.com ~all"
    }
  }
}

# SSM Parameter Store outputs
output "ssm_parameter_prefix" {
  description = "Prefix for SSM parameters containing SES credentials"
  value       = var.ssm_parameter_prefix
}

output "ssm_parameters" {
  description = "SSM parameter names for SES configuration"
  value = {
    smtp_username = aws_ssm_parameter.smtp_username.name
    smtp_password = aws_ssm_parameter.smtp_password.name
    smtp_endpoint = aws_ssm_parameter.smtp_endpoint.name
    smtp_port     = aws_ssm_parameter.smtp_port.name
    from_email    = aws_ssm_parameter.from_email.name
    domain        = aws_ssm_parameter.domain.name
  }
}

output "iam_policy_arn_ssm_read" {
  description = "IAM policy ARN for reading SES SSM parameters (attach to application role)"
  value       = aws_iam_policy.ssm_read_ses.arn
}

output "kms_key_id" {
  description = "KMS key ID used for encrypting SSM parameters"
  value       = aws_kms_key.ssm.id
}
