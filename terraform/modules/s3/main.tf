provider "aws" {
  region = "ap-south-1"
}

resource "aws_s3_bucket" "frontend" {
  bucket = var.bucket_name
  force_destroy = true

  tags = {
    Name        = "${var.bucket_name}-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket_website_configuration" "frontend_website" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "env_js" {
  bucket = var.bucket_name
  key    = "env.js"
  content = templatefile("${path.module}/env.js.tmpl", {
    BACKEND_URL = var.environment == "prod" ? "https://api.615915.xyz" : "https://api-staging.615915.xyz"
  })

  content_type = "application/javascript"
depends_on = [aws_s3_bucket.frontend ]
}









# resource "local_file" "env_js" {
#   content = <<EOF
# window._env_ = {
#   BACKEND_URL: "${api-}"
# };
# EOF

#   filename = "${path.module}/dist/env.js"
# }
# resource "aws_s3_object" "env_js" {
#   bucket = aws_s3_bucket.frontend-bucket.id
#   key    = "env.js"
#   source = local_file.env_js.filename
#   content_type = "application/javascript"
#  # acl    = "public-read"
# }

