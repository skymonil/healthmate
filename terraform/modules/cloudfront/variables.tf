variable "environment" {
  description = "Environment (prod|staging)"
  type        = string
  validation {
    condition     = contains(["prod", "staging"], var.environment)
    error_message = "Must be 'prod' or 'staging'."
  }
}

variable "domain_alias" {
  description = "CloudFront alias domain (e.g., '615915.xyz' or 'staging.615915.xyz')"
  type        = string
}

variable "s3_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket (e.g., 'bucket.s3.ap-south-1.amazonaws.com')"
  type        = string
}

variable "s3_bucket_id" {
  description = "ID of the S3 bucket"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate (must cover both domains and be in us-east-1)"
  type        = string
}