variable "region" {
  type    = string
  default = ""
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "vpc_name" {
  description = "Name for the VPC"
  type        = string
  validation {
    condition     = length(var.vpc_name) > 0
    error_message = "VPC Name cannot be empty"
  }
}

variable "vpc_cidr_block" {
  description = "The CIDR block for the VPC"
  type        = string
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = []
}

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets"
  type        = list(string)
  default     = []
}

variable "bucket_name" {
  description = "name of the s3 bucket"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate (must cover both domains and be in us-east-1)"
  type        = string
}

variable "alb_acm_certificate_arn" {
  description = "ARN of the ACM certificate (must cover both domains and be in us-east-1)"
  type        = string
}

variable "domain_alias" {
  description = "CloudFront alias domain (e.g., '615915.xyz' or 'staging.615915.xyz')"
  type        = string
}

variable "ecs_service_name" {
  description = "Name for the ECS service"
  type        = string
}

variable "cluster_name" {
  description = "Name for the ECS cluster"
  type        = string
}

variable "family_name" {
  description = "Name for the ECS cluster"
  type        = string
}

variable "image" {
  description = "url of the docker image"
  type        = string
}

# The following variables were added
variable "container_memory" {
  description = "The memory (in MiB) for the container."
  type        = number
}

variable "container_port" {
  description = "The port for the container."
  type        = number
}

variable "cpu" {
  description = "The CPU units for the ECS task."
  type        = number
}

variable "assign_public_ip" {
  description = "Whether to assign a public IP to the ECS task."
  type        = bool
}

variable "container_name" {
  description = "The name for the ECS container."
  type        = string
}

variable "service_launch_type" {
  description = "The launch type for the ECS service (e.g., FARGATE or EC2)."
  type        = string
}

variable "memory" {
  description = "The memory (in MiB) for the ECS task."
  type        = number
}

variable "log_group" {
  description = "The CloudWatch log group for the ECS task."
  type        = string

}

variable "container_cpu" {
  description = "The CPU units for the container within the ECS task."
  type        = number
}

# This is an important one that should be added to handle subnet IDs from another module

variable "SPRING_APPLICATION_NAME" {
  description = "Value of the SPRING_APPLICATION_NAME"
  type        = string
  sensitive   = true
}


variable "SPRING_DATA_MONGODB_URI" {
  description = "Value of MONGODB_URI"
  type        = string
  sensitive   = true
}
variable "SPRING_DATA_MONGODB_DATABASE" {
  description = "Value of MONGODB_DATABASE"
  type        = string
  sensitive   = true
}
variable "SPRING_MAIL_HOST" {
  description = " value of SPRING_MAIL_HOST"
  type        = string
  sensitive   = true
}
variable "SPRING_MAIL_PORT" {
  description = "Value OF SPRING_MAIL_PORT"
  type        = number
  sensitive   = true
}

variable "SPRING_MAIL_USERNAME" {
  description = "Value OF SPRING_MAIL_USERNAME"
  type        = string
  sensitive   = true
}
variable "SPRING_MAIL_PASSWORD" {
  description = "Value OF SPRING_MAIL_PASSWORD"
  type        = string
  sensitive   = true
}
variable "GEMINI_API_KEY" {
  description = "Value OF GEMINI_API_KEY"
  type        = string
  sensitive   = true
}

variable "SPRING_MAIL_SMTP_AUTH" {
  description = "Enable SMTP authentication for mail server"
  type        = bool
  default     = true
  sensitive   = true
}

variable "SPRING_MAIL_SMTP_STARTTLS_ENABLE" {
  description = "Enable STARTTLS for mail server"
  type        = bool
  default     = true
  sensitive   = true
}



