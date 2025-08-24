resource "aws_lb" "shared_alb" {
  name               = "shared-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = var.public_subnet_ids


  enable_deletion_protection = false

  tags = {
    Name        = "shared-${var.environment}-alb"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}



resource "aws_security_group" "alb_sg" {
  name        = "alb-sg"
  description = "Allow HTTP from CloudFront (public)"
  vpc_id      = var.vpc_id

  ingress {
    description = "Allow HTTP from anywhere (CloudFront)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # ✅ Accept HTTP from CloudFront or anywhere
  }

   ingress {
    description = "Allow HTTP from anywhere (CloudFront)"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # ✅ Accept HTTP from CloudFront or anywhere
  }

  ingress {
    description = "Allow HTTPS from anywhere (CloudFront)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # ✅ Accept HTTP from CloudFront or anywhere
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







resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.shared_alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.alb_acm_certificate_arn

  default_action {
    type             = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}