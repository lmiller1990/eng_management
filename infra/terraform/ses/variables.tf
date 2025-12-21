variable "aws_region" {
  description = "AWS region for SES resources"
  type        = string
  default     = "ap-southeast-2"
}

variable "domain_name" {
  description = "Sending domain to verify with SES"
  type        = string
  default     = "notae.dev"
}

variable "mail_from_subdomain" {
  description = "Subdomain to use for Mail-From (SPF) records"
  type        = string
  default     = "mail"
}

variable "create_route53_zone" {
  description = "Whether to create a new Route53 public hosted zone for the domain"
  type        = bool
  default     = true
}

variable "existing_hosted_zone_id" {
  description = "If using an existing Route53 hosted zone, provide its ID; otherwise leave blank"
  type        = string
  default     = ""
}

variable "dmarc_rua_email" {
  description = "Email address to receive DMARC aggregate reports"
  type        = string
  default     = "dmarc@notae.dev"
}

variable "ses_user_name" {
  description = "IAM username for SES SMTP sending"
  type        = string
  default     = "ses-smtp-sender"
}

variable "project_name" {
  description = "Project tag/stem for naming"
  type        = string
  default     = "notae"
}

variable "tags" {
  description = "Additional tags to apply"
  type        = map(string)
  default     = {}
}
