locals {
  mail_from_domain = "${var.mail_from_subdomain}.${var.domain_name}"
  manage_dns       = var.create_route53_zone || var.existing_hosted_zone_id != ""
  hosted_zone_id   = var.existing_hosted_zone_id != "" ? var.existing_hosted_zone_id : (var.create_route53_zone ? aws_route53_zone.domain[0].zone_id : "")

  common_tags = merge({
    Project = var.project_name
    Managed = "terraform"
  }, var.tags)
}

resource "aws_route53_zone" "domain" {
  count = var.create_route53_zone ? 1 : 0

  name = var.domain_name

  tags = local.common_tags
}

resource "aws_ses_domain_identity" "domain" {
  domain = var.domain_name
}

resource "aws_ses_domain_dkim" "domain" {
  domain = aws_ses_domain_identity.domain.domain
}

resource "aws_ses_domain_mail_from" "domain" {
  domain           = aws_ses_domain_identity.domain.domain
  mail_from_domain = local.mail_from_domain

  behavior_on_mx_failure = "USE_DEFAULT_VALUE"
}

resource "aws_route53_record" "ses_verification" {
  count = local.manage_dns ? 1 : 0

  zone_id = local.hosted_zone_id
  name    = "_amazonses.${var.domain_name}"
  type    = "TXT"
  ttl     = 300
  records = [aws_ses_domain_identity.domain.verification_token]
}

resource "aws_route53_record" "dkim" {
  for_each = local.manage_dns ? toset(aws_ses_domain_dkim.domain.dkim_tokens) : toset([])

  zone_id = local.hosted_zone_id
  name    = "${each.value}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["${each.value}.dkim.amazonses.com"]
}

resource "aws_route53_record" "mail_from_mx" {
  count = local.manage_dns ? 1 : 0

  zone_id = local.hosted_zone_id
  name    = local.mail_from_domain
  type    = "MX"
  ttl     = 300
  records = ["10 feedback-smtp.${var.aws_region}.amazonaws.com"]
}

resource "aws_route53_record" "mail_from_spf" {
  count = local.manage_dns ? 1 : 0

  zone_id = local.hosted_zone_id
  name    = local.mail_from_domain
  type    = "TXT"
  ttl     = 300
  records = ["v=spf1 include:amazonses.com -all"]
}

resource "aws_route53_record" "dmarc" {
  count = local.manage_dns ? 1 : 0

  zone_id = local.hosted_zone_id
  name    = "_dmarc.${var.domain_name}"
  type    = "TXT"
  ttl     = 300
  records = ["v=DMARC1; p=none; adkim=s; aspf=s; rua=mailto:${var.dmarc_rua_email}; pct=100; fo=1"]
}

data "aws_iam_policy_document" "ses_send" {
  statement {
    sid    = "AllowSendEmail"
    effect = "Allow"
    actions = [
      "ses:SendEmail",
      "ses:SendRawEmail"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_user" "ses_sender" {
  name          = var.ses_user_name
  force_destroy = true
  tags          = local.common_tags
}

resource "aws_iam_user_policy" "ses_send" {
  name   = "${var.project_name}-ses-send"
  user   = aws_iam_user.ses_sender.name
  policy = data.aws_iam_policy_document.ses_send.json
}

resource "aws_iam_access_key" "ses_sender" {
  user = aws_iam_user.ses_sender.name
}
