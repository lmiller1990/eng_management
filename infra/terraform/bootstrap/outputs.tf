output "state_bucket_name" {
  value       = aws_s3_bucket.state.bucket
  description = "S3 bucket used for Terraform state"
}

output "dynamodb_table_name" {
  value       = aws_dynamodb_table.locks.name
  description = "DynamoDB table used for Terraform state locking"
}
