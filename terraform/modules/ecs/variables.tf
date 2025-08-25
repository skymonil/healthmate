variable "cluster_name" {
  description = "Name for the ECS cluster"
  type        = string
}

variable "family_name" {
  description = "Name for the ECS task definiton family"
  type        = string
}

variable "compatibilities" {
  description = "List of ECS launch types to support"
  type        = list(string)
  default     = ["FARGATE"] # Optional default
}

variable "network_mode" {
  description = "Name of the network mode"
  type        = string
  default     = "awsvpc"
}

variable "container_port" {
  description = "Port of the container"
  type        = number

}

variable "container_name" {
  description = "Name of the container"
  type        = string
}

variable "image" {
  description = "url of the image"
  type        = string
}
variable "cpu" {
  description = "url of the image"
  type        = number
}
variable "memory" {
  description = "url of the image"
  type        = number
}
variable "container_cpu" {
  description = "url of the image"
  type        = number
}
variable "container_memory" {
  description = "url of the image"
  type        = number
}

variable "aws_region" {
  description = "Name of the region"
  type        = string
}

variable "log_group" {
  description = "log group"
  type        = string
}

variable "ecs_service_name" {
  description = "Name of the ECS service"
  type        = string
}

variable "service_launch_type" {
  description = "Launch type of the ecs service"
  type        = string
}

variable "public_subnet_ids" {
  description = "A list of public subnet IDs to place the ECS tasks in."
  type        = list(string)
}

variable "ecs_security_group_ids" {
  description = "A list of security group IDs for the ECS tasks."
  type        = list(string)
}

variable "assign_public_ip" {
  description = "To decided whether to assign tasks a public ip"
  type        = bool
}

variable "environment" {
  description = "Environment (staging|prod)"
  type        = string
  validation {
    condition     = contains(["staging", "prod"], var.environment)
    error_message = "Must be 'staging' or 'prod'."
  }
}

variable "aws_lb_target_group_arn" {
  description = "target group of alb"
  type        = string
}



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
  type        = string
  default     = "true"
  sensitive   = true
}

variable "SPRING_MAIL_SMTP_STARTTLS_ENABLE" {
  description = "Enable STARTTLS for mail server"
  type        = bool
  default     = "true"
  sensitive   = true
}
