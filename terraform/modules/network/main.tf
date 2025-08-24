resource "aws_vpc" "caam_vpc" {
  cidr_block       = var.vpc_cidr_block
  instance_tenancy = "default"

  tags = {
    Name      = var.vpc_name
    ManagedBy = "Terraform"
     Environment = var.environment
  }
}

resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.caam_vpc.id

  tags = {
    Name = "internet-gateway-${var.environment}"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.caam_vpc.id
  count                   = length(var.availability_zones)
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name      = "public-${var.region}-${var.availability_zones[count.index]}-${var.environment}"
    ManagedBy = "Terraform"
  }
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.caam_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway.id
  }

  tags = {
    Name      = "public-rt-${var.environment}"
    ManagedBy = "Terraform"
  }
}

resource "aws_route_table_association" "public_route_table_associations" {
  count     = length(var.availability_zones)
  subnet_id = element(aws_subnet.public_subnet[*].id, count.index)

  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_security_group" "ecs_security_group_ids" {
  name        = "ecs-sg"
  description = "Allow HTTP from CloudFront (public)"
  vpc_id      = aws_vpc.caam_vpc.id

  ingress {
    description = "Allow HTTP from anywhere (CloudFront)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # ✅ Accept HTTP from CloudFront or anywhere
  }

  ingress {
    description = "Allow HTTP from anywhere (CloudFront)"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # ✅ Accept HTTP from CloudFront or anywhere
  }

  ingress {
    description = "Allow HTTPS from anywhere (CloudFront)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # ✅ Accept HTTP from CloudFront or anywhere
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "alb-sg"
  }
}
