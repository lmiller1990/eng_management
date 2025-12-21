output "route53_zone_id" {
  description = "Route53 zone used for SES records (if managed here)"
  value       = local.hosted_zone_id
  depends_on  = [aws_route53_zone.domain]
}

output "mail_from_domain" {
  description = "Mail-From domain configured for SES SPF"
  value       = local.mail_from_domain
}

output "ses_domain_identity_arn" {
  description = "SES domain identity ARN"
  value       = aws_ses_domain_identity.domain.arn
}

output "ses_smtp_username" {
  description = "SMTP username (IAM access key ID) for sending"
  value       = aws_iam_access_key.ses_sender.id
}

output "ses_smtp_password_v4" {
  description = "SMTP password derived from the IAM secret access key"
  value       = aws_iam_access_key.ses_sender.ses_smtp_password_v4
  sensitive   = true
}

output "ses_smtp_endpoint" {
  description = "SMTP endpoint hostname for the configured region"
  value       = "email-smtp.${var.aws_region}.amazonaws.com"
}

output "ses_smtp_ports" {
  description = "Supported SMTP ports"
  value       = ["25", "465", "587", "2465", "2587"]
}

output "domain_verification_record" {
  description = "TXT record required for SES domain verification"
  value = {
    name  = "_amazonses.${var.domain_name}"
    type  = "TXT"
    value = aws_ses_domain_identity.domain.verification_token
  }
}

output "dkim_cname_records" {
  description = "DKIM CNAME records required for SES"
  value = {
    for token in aws_ses_domain_dkim.domain.dkim_tokens :
    "${token}._domainkey.${var.domain_name}" => "${token}.dkim.amazonses.com"
  }
}

output "mail_from_mx_record" {
  description = "MX record for the Mail-From subdomain"
  value = {
    name   = local.mail_from_domain
    type   = "MX"
    values = ["10 feedback-smtp.${var.aws_region}.amazonaws.com"]
  }
}

output "mail_from_spf_record" {
  description = "SPF record for the Mail-From subdomain"
  value = {
    name  = local.mail_from_domain
    type  = "TXT"
    value = "v=spf1 include:amazonses.com -all"
  }
}

output "dmarc_record" {
  description = "DMARC record for the sending domain"
  value = {
    name  = "_dmarc.${var.domain_name}"
    type  = "TXT"
    value = "v=DMARC1; p=none; adkim=s; aspf=s; rua=mailto:${var.dmarc_rua_email}; pct=100; fo=1"
  }
}
