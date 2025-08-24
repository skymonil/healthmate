variable "vpc_cidr_block" {
  type        = string
  description = "Primary CIDR block for the VPC"
  validation {
    condition     = can(cidrnetmask(var.vpc_cidr_block)) && tonumber(split("/", var.vpc_cidr_block)[1]) <= 24
    error_message = "Must be a valid CIDR block with a mask of /24 or smaller (e.g., /24, /23, /22, etc.)."
  }
}


variable "region" {
  type        = string
  description = "AWS Region"
}

variable "availability_zones" {
  description = "List of availability zone to deploy subnets into"
  type        = list(string)

  validation {
    condition     = (var.environment == "prod" && length(var.availability_zones) >= 2) || (var.environment == "staging" && length(var.availability_zones) >= 1)
    error_message = "Number of AZs does not meet environment requirements. Prod Requires AZs >=2, Staging requires environment >=1"
  }
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (must match AZ count)"
  type        = list(string)

  validation {
    condition     = length(var.public_subnet_cidrs) == length(var.availability_zones)
    error_message = "Public subnet CIDRs must match AZ count"
  }
}

variable "vpc_name" {
  description = "Name for the VPC"
  type        = string

  validation {
    condition     = length(var.vpc_name) > 0
    error_message = "VPC Name cannot be empty"
  }
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["staging", "prod"], var.environment)
    error_message = "Must be staging or prod"
  }
}