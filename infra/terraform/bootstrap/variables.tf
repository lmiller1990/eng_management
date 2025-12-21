variable "aws_region" {
  description = "AWS region for backend resources"
  type        = string
  default     = "ap-southeast-2"
}

variable "state_bucket_name" {
  description = "Name for the Terraform state bucket"
  type        = string
  default     = "notae-terraform-state"
}

variable "dynamodb_table_name" {
  description = "Name for the DynamoDB table used for state locking"
  type        = string
  default     = "notae-terraform-locks"
}

variable "tags" {
  description = "Additional tags to apply"
  type        = map(string)
  default     = {}
}
