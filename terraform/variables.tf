variable "aws_region" {
  description = "AWS region for SES resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
  default     = "production"
}

variable "domain" {
  description = "Domain to verify and use for sending emails"
  type        = string
  default     = "notae.dev"
}

variable "from_email_address" {
  description = "Default from email address"
  type        = string
  default     = "notifications@notae.dev"
}

variable "enable_configuration_set" {
  description = "Enable SES configuration set for tracking email events"
  type        = bool
  default     = true
}
