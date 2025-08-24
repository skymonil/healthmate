output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.caam_vpc.id
}

# network/outputs.tf
output "public_subnet_ids" {
  value = aws_subnet.public_subnet[*].id
}

output "ecs_security_group_ids" {
  value = aws_security_group.ecs_security_group_ids.id
}

