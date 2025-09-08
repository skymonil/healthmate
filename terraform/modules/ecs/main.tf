

resource "aws_ecs_cluster" "ecs_cluster" {
  name = var.cluster_name
  # The setting block within the aws_ecs_cluster resource in Terraform is used to configure specific cluster-wide settings for an Amazon ECS (Elastic Container Service) cluster.
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  tags = {
    Environment = var.environment
  }
}

# Create the IAM role that the ECS task will assume
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Attach the standard AWS managed policy for ECS task execution
resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy_attach" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Define a custom policy for additional permissions
resource "aws_iam_role_policy" "custom_ecs_policy" {
  name = "custom-ecs-policy"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "ECRReadAccess",
        Effect = "Allow",
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ],
        Resource = "*"
      },
      {
        Sid    = "CloudWatchWriteAccess",
        Effect = "Allow",
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*" # Best practice is to limit this to a specific log group ARN
      },
      {
        Sid      = "SSMReadAccess",
        Effect   = "Allow",
        Action   = "ssm:GetParameters",
        Resource = "*"
      }
    ]
  })
}

resource "aws_ssm_parameter" "spring_application_name" {
  # The name of the parameter. We're using a path-based naming convention for organization.
  name = "/healthmate/dev/spring_application_name"
  # A brief description of the parameter.
  description = "Value of the SPRING_APPLICATION_NAME for the healthmate app"
  # The value of the parameter. We reference the Terraform variable.
  value = var.SPRING_APPLICATION_NAME
  # The type of the parameter. "String" is suitable for non-sensitive data.
  type = "String"
  # This tag is helpful for identifying the application the parameter belongs to.
  tags = {
    Application = "healthmate"
  }
}

# Parameter for SPRING_DATA_MONGODB_URI
resource "aws_ssm_parameter" "spring_data_mongodb_uri" {
  name        = "/healthmate/dev/spring_data_mongodb_uri"
  description = "Value of the MONGODB_URI for the healthmate app"
  # We use the sensitive variable from the `variables.tf` file.
  value = var.SPRING_DATA_MONGODB_URI
  # Set the type to "SecureString" for this sensitive URI.
  type = "SecureString"
  tags = {
    Application = "healthmate"
  }
}

# Parameter for SPRING_DATA_MONGODB_DATABASE
resource "aws_ssm_parameter" "spring_data_mongodb_database" {
  name        = "/healthmate/dev/spring_data_mongodb_database"
  description = "Value of the MONGODB_DATABASE for the healthmate app"
  value       = var.SPRING_DATA_MONGODB_DATABASE
  # Set the type to "SecureString" as database names can be considered sensitive.
  type = "SecureString"
  tags = {
    Application = "healthmate"
  }
}

# Parameter for SPRING_MAIL_HOST
resource "aws_ssm_parameter" "spring_mail_host" {
  name        = "/healthmate/dev/spring_mail_host"
  description = "Value of the SPRING_MAIL_HOST for the healthmate app"
  value       = var.SPRING_MAIL_HOST
  type        = "SecureString"
  tags = {
    Application = "healthmate"
  }
}

# Parameter for SPRING_MAIL_PORT
resource "aws_ssm_parameter" "spring_mail_port" {
  name        = "/healthmate/dev/spring_mail_port"
  description = "Value of the SPRING_MAIL_PORT for the healthmate app"
  value       = tostring(var.SPRING_MAIL_PORT) # Convert the number variable to a string for SSM
  type        = "String"
  tags = {
    Application = "healthmate"
  }
}

# Parameter for SPRING_MAIL_USERNAME
resource "aws_ssm_parameter" "spring_mail_username" {
  name        = "/healthmate/dev/spring_mail_username"
  description = "Value of the SPRING_MAIL_USERNAME for the healthmate app"
  value       = var.SPRING_MAIL_USERNAME
  type        = "SecureString"
  tags = {
    Application = "healthmate"
  }
}

# Parameter for SPRING_MAIL_PASSWORD
resource "aws_ssm_parameter" "spring_mail_password" {
  name        = "/healthmate/dev/spring_mail_password"
  description = "Value of the SPRING_MAIL_PASSWORD for the healthmate app"
  value       = var.SPRING_MAIL_PASSWORD
  type        = "SecureString"
  tags = {
    Application = "healthmate"
  }
}

# Parameter for GEMINI_API_KEY
resource "aws_ssm_parameter" "gemini_api_key" {
  name        = "/healthmate/dev/gemini_api_key"
  description = "Value of the GEMINI_API_KEY for the healthmate app"
  value       = var.GEMINI_API_KEY
  type        = "SecureString"
  tags = {
    Application = "healthmate"
  }
}


resource "aws_cloudwatch_log_group" "ecs_app_logs" {
  name              = var.log_group
  retention_in_days = 7

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}


resource "aws_ecs_task_definition" "aw_ecs_task" {
  family                   = var.family_name
  requires_compatibilities = var.compatibilities
  network_mode             = var.network_mode
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = var.container_name
      image     = var.image
      cpu       = var.container_cpu    # per-container CPU (relative for EC2, hard limit for Fargate)
      memory    = var.container_memory # per-container Memory
      essential = true
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }

      ]
      environment = [
        {
          name  = "SPRING_APPLICATION_NAME"
          value = var.SPRING_APPLICATION_NAME
        },
        {
          name  = "SPRING_DATA_MONGODB_URI"
          value = var.SPRING_DATA_MONGODB_URI
        },
        {
          name  = "SPRING_DATA_MONGODB_DATABASE"
          value = var.SPRING_DATA_MONGODB_DATABASE
        },
        {
          name  = "SPRING_MAIL_HOST"
          value = var.SPRING_MAIL_HOST
        },
        {
          name  = "SPRING_MAIL_PORT"
          value = tostring(var.SPRING_MAIL_PORT)
        },
        {
          name  = "SPRING_MAIL_USERNAME"
          value = var.SPRING_MAIL_USERNAME
        },
        {
          name  = "SPRING_MAIL_PASSWORD"
          value = var.SPRING_MAIL_PASSWORD
        },
        {
          name  = "SPRING_MAIL_SMTP_AUTH"
          value = tostring(var.SPRING_MAIL_SMTP_AUTH)
        },
        {
          name  = "SPRING_MAIL_SMTP_SSL_ENABLE"
          value = tostring(var.SPRING_MAIL_SMTP_SSL_ENABLE)
        },
        {
          name  = "GEMINI_API_KEY"
          value = var.GEMINI_API_KEY
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group = aws_cloudwatch_log_group.ecs_app_logs.name

          awslogs-region        = var.aws_region
          awslogs-stream-prefix = var.container_name
        }
      }
    }
  ])
}


resource "aws_ecs_service" "example" {
  name            = var.ecs_service_name
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.aw_ecs_task.id
   desired_count   = 1
  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 2
  }

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }
  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = var.ecs_security_group_ids
    assign_public_ip = var.assign_public_ip
  }

  depends_on = [
    aws_iam_role_policy_attachment.ecs_task_execution_policy_attach
  ]

  load_balancer {
    target_group_arn = var.aws_lb_target_group_arn
    container_name   = var.container_name # must match Task Definition container name
    container_port   = 8080
  }

}